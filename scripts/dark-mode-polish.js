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
  
  // Make component backgrounds surface-900 instead of surface-950 to contrast with globals.css body
  content = content.replace(/dark:bg-surface-950/g, 'dark:bg-surface-900');
  
  // Fix header bg-white/95
  if (file.includes('header.tsx')) {
    content = content.replace(/bg-white dark:bg-surface-900\/95/g, 'bg-white/95 dark:bg-surface-900/95');
    // clean up messy classes
    content = content.replace(/dark:hover:bg-surface-[0-9]+ dark:bg-surface-[0-9]+ dark:hover:bg-surface-[0-9]+/g, 'dark:hover:bg-surface-800');
    content = content.replace(/dark:text-surface-[0-9]+ dark:text-surface-[0-9]+/g, 'dark:text-surface-400');
    content = content.replace(/dark:bg-surface-900\/95 backdrop-blur/g, 'dark:bg-surface-900/95 backdrop-blur');
  }

  // General cleanup of weird duplicates that might have happened
  content = content.replace(/dark:hover:bg-surface-800 dark:bg-surface-800/g, 'dark:hover:bg-surface-800');
  content = content.replace(/dark:hover:bg-surface-[0-9]+ dark:hover:bg-surface-[0-9]+/g, (match) => match.split(' ')[0]);

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Polished ${file}`);
  }
});

console.log(`Polish done. Updated ${changedFiles} files.`);
