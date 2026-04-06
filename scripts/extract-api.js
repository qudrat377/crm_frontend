const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) { 
        results = results.concat(walk(file));
      } else { 
        if (file.endsWith('.controller.ts')) {
          results.push(file);
        }
      }
    });
  } catch (e) {
    console.error(e);
  }
  return results;
}

const files = walk('c:/Users/user/Desktop/crm-typeorm/src');
const apiList = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const controllerMatch = content.match(/@Controller\(['"]([^'"]+)['"]\)/);
  const basePath = controllerMatch ? '/' + controllerMatch[1] : '';

  const methodRegex = /@(Get|Post|Patch|Put|Delete)\(['"]?([^'"]*)['"]?\)/g;
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    const httpMethod = match[1].toUpperCase();
    const subRoute = match[2] ? '/' + match[2].replace(/^\//, '') : '';
    const fullPath = (basePath + subRoute).replace(/\/+/g, '/');
    apiList.push(`${httpMethod.padEnd(7)} ${fullPath}`);
  }
});

apiList.sort();
console.log("=== BACKEND APIs ===");
console.log(apiList.join('\n'));
