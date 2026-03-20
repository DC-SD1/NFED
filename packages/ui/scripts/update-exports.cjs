const fs = require('fs');
const path = require('path');
const glob = require('glob');

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Scan for components and hooks
const components = glob.sync('src/components/*.tsx', { cwd: path.join(__dirname, '..') });
const hooks = glob.sync('src/hooks/*.tsx', { cwd: path.join(__dirname, '..') });

// Build exports - start with static exports
const exportMap = {
  ".": "./src/index.ts",
  "./styles/globals.css": "./src/styles/globals.css"
};

// Add component exports
components.forEach(file => {
  const name = path.basename(file, '.tsx');
  exportMap[`./components/${name}`] = `./${file}`;
});

// Add hook exports
hooks.forEach(file => {
  const name = path.basename(file, '.tsx');
  exportMap[`./hooks/${name}`] = `./${file}`;
});

// Keep other non-component exports (like 3d-card, animated-gradient-text, etc.)
Object.entries(packageJson.exports).forEach(([key, value]) => {
  if (!key.startsWith('./components/') && !key.startsWith('./hooks/') && 
      key !== '.' && key !== './styles/globals.css') {
    exportMap[key] = value;
  }
});

// Sort exports for consistency
const sortedExports = {};
const keys = Object.keys(exportMap).sort((a, b) => {
  // Sort special exports first
  if (a === '.') return -1;
  if (b === '.') return 1;
  if (a === './styles/globals.css') return -1;
  if (b === './styles/globals.css') return 1;
  
  // Then sort alphabetically
  return a.localeCompare(b);
});

keys.forEach(key => {
  sortedExports[key] = exportMap[key];
});

packageJson.exports = sortedExports;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ Updated package.json exports');
console.log(`📦 Found ${components.length} components and ${hooks.length} hooks`);