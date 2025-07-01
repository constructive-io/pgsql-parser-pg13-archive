const fs = require('fs');
const path = require('path');

const generatedJsonPath = './generated.json';
const fixturesDir = './__fixtures__';
const outputDir = './legacy-13';

function createDirectoryStructure(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  console.log('Reading generated.json to get fixture paths...');
  const generatedData = JSON.parse(fs.readFileSync(generatedJsonPath, 'utf8'));
  const fixturePaths = Object.keys(generatedData);
  
  console.log(`Found ${fixturePaths.length} fixture files to copy`);
  
  if (fs.existsSync(outputDir)) {
    console.log('Removing existing legacy-13 directory...');
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(outputDir, { recursive: true });
  
  let copiedCount = 0;
  let errorCount = 0;
  
  for (const fixturePath of fixturePaths) {
    const sourcePath = path.join(fixturesDir, fixturePath);
    const destPath = path.join(outputDir, fixturePath);
    
    try {
      createDirectoryStructure(destPath);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
        console.log(`Copied: ${fixturePath}`);
      } else {
        console.error(`Source file not found: ${sourcePath}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`Error copying ${fixturePath}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`- Successfully copied: ${copiedCount} files`);
  console.log(`- Errors: ${errorCount} files`);
  console.log(`- Output directory: ${outputDir}`);
  
  console.log('\nDirectory structure created:');
  function listDirectory(dir, prefix = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const currentPrefix = prefix + (isLast ? '└── ' : '├── ');
      console.log(currentPrefix + item.name);
      
      if (item.isDirectory()) {
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        listDirectory(path.join(dir, item.name), nextPrefix);
      }
    });
  }
  
  if (fs.existsSync(outputDir)) {
    listDirectory(outputDir);
  }
}

if (require.main === module) {
  main();
}
