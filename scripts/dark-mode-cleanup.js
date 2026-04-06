const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  content = content.replace(/dark:text-surface-[0-9]+ dark:text-surface-[0-9]+/g, (match) => match.split(' ')[0]);
  content = content.replace(/dark:bg-surface-[0-9]+(?:\/[0-9]+)? dark:bg-surface-[0-9]+(?:\/[0-9]+)?/g, (match) => match.split(' ')[0]);
  content = content.replace(/dark:border-surface-[0-9]+ dark:border-surface-[0-9]+/g, (match) => match.split(' ')[0]);
  content = content.replace(/dark:hover:bg-surface-[0-9]+ dark:hover:bg-surface-[0-9]+/g, (match) => match.split(' ')[0]);

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Cleaned up ${file}`);
  }
});

console.log(`Cleanup done. Updated ${changedFiles} files.`);
