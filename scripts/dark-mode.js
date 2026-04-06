const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { regex: /bg-white(?!\s+dark:bg)/g, replace: 'bg-white dark:bg-surface-950' },
  { regex: /bg-surface-50(?!\s+dark:bg)/g, replace: 'bg-surface-50 dark:bg-surface-900/50' },
  { regex: /bg-surface-100(?!\s+dark:bg)/g, replace: 'bg-surface-100 dark:bg-surface-800' },
  { regex: /bg-surface-200(?!\s+dark:bg)/g, replace: 'bg-surface-200 dark:bg-surface-700' },
  { regex: /bg-surface-900\/50(?!\s+dark:bg)/g, replace: 'bg-surface-900/50 dark:bg-surface-950/80' },
  
  // Hovers
  { regex: /hover:bg-surface-50(?!\s+dark:hover:bg)/g, replace: 'hover:bg-surface-50 dark:hover:bg-surface-800' },
  { regex: /hover:bg-surface-100(?!\s+dark:hover:bg)/g, replace: 'hover:bg-surface-100 dark:hover:bg-surface-800' },
  { regex: /hover:bg-surface-200(?!\s+dark:hover:bg)/g, replace: 'hover:bg-surface-200 dark:hover:bg-surface-700' },

  // Borders
  { regex: /border-surface-100(?!\s+dark:border)/g, replace: 'border-surface-100 dark:border-surface-800' },
  { regex: /border-surface-200(?!\s+dark:border)/g, replace: 'border-surface-200 dark:border-surface-700' },
  
  // Text
  { regex: /text-surface-900(?!\s+dark:text)/g, replace: 'text-surface-900 dark:text-surface-50' },
  { regex: /text-surface-800(?!\s+dark:text)/g, replace: 'text-surface-800 dark:text-surface-100' },
  { regex: /text-surface-700(?!\s+dark:text)/g, replace: 'text-surface-700 dark:text-surface-200' },
  { regex: /text-surface-600(?!\s+dark:text)/g, replace: 'text-surface-600 dark:text-surface-400' },
  { regex: /text-surface-500(?!\s+dark:text)/g, replace: 'text-surface-500 dark:text-surface-400' },
  { regex: /text-surface-400(?!\s+dark:text)/g, replace: 'text-surface-400 dark:text-surface-500' },
];

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
  
  replacements.forEach(({regex, replace}) => {
    content = content.replace(regex, replace);
  });
  
  // Specific fix for table.tsx where it uses bg-muted / text-muted-foreground
  if (file.includes('table.tsx')) {
    content = content.replace(/bg-muted\/50/g, 'bg-surface-50 dark:bg-surface-800/50');
    content = content.replace(/bg-muted/g, 'bg-surface-100 dark:bg-surface-800');
    content = content.replace(/text-muted-foreground/g, 'text-surface-500 dark:text-surface-400');
  }

  // Specific fix for input.tsx
  if (file.includes('input.tsx') || file.includes('select.tsx')) {
    content = content.replace(/bg-white dark:bg-surface-950/g, 'bg-white dark:bg-surface-950');
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Done. Updated ${changedFiles} files.`);
