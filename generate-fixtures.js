const fs = require('fs');
const path = require('path');

const testFilePath = './packages/deparser/__tests__/kitchen-sink.test.ts';
const fixturesDir = './__fixtures__';
const outputFile = './generated.json';

function parseTestFile() {
  const content = fs.readFileSync(testFilePath, 'utf8');
  const lines = content.split('\n');
  
  const fixtureFiles = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('//') || line.startsWith('/*')) {
      continue;
    }
    
    if (line.includes('xit(')) {
      continue;
    }
    
    if (line.includes('it(') && line.includes('check(')) {
      const checkMatch = line.match(/check\(['"`]([^'"`]+)['"`]\)/);
      if (checkMatch) {
        fixtureFiles.push(checkMatch[1]);
      }
    }
    
    if (line.includes('it(') && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (nextLine.includes('check(') && !nextLine.includes('xit(')) {
        const checkMatch = nextLine.match(/check\(['"`]([^'"`]+)['"`]\)/);
        if (checkMatch) {
          fixtureFiles.push(checkMatch[1]);
        }
      }
    }
  }
  
  return [...new Set(fixtureFiles)]; // Remove duplicates
}

function readFixtureFiles(fixtureFiles) {
  const result = {};
  const missingFiles = [];
  
  for (const fixturePath of fixtureFiles) {
    const fullPath = path.join(fixturesDir, fixturePath);
    
    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        result[fixturePath] = content;
      } else {
        missingFiles.push(fixturePath);
      }
    } catch (error) {
      console.error(`Error reading ${fullPath}:`, error.message);
      missingFiles.push(fixturePath);
    }
  }
  
  if (missingFiles.length > 0) {
    console.warn('Missing fixture files:', missingFiles);
  }
  
  return result;
}

function main() {
  console.log('Parsing test file...');
  const fixtureFiles = parseTestFile();
  console.log(`Found ${fixtureFiles.length} fixture files from passing tests`);
  
  console.log('Reading fixture file contents...');
  const fixtureContents = readFixtureFiles(fixtureFiles);
  console.log(`Successfully read ${Object.keys(fixtureContents).length} fixture files`);
  
  console.log('Writing generated.json...');
  fs.writeFileSync(outputFile, JSON.stringify(fixtureContents, null, 2));
  console.log(`Generated ${outputFile} with ${Object.keys(fixtureContents).length} entries`);
  
  console.log('\nSample entries:');
  const entries = Object.entries(fixtureContents);
  for (let i = 0; i < Math.min(5, entries.length); i++) {
    const [path, content] = entries[i];
    console.log(`${path}: ${content.length} characters`);
  }
}

if (require.main === module) {
  main();
}
