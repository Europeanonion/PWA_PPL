/**
 * PWA Path Checker
 * Scans your PWA for broken paths, missing resources, and inconsistencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import chalk from 'chalk';

// Get the current directory and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');  // Up one level from "dev scripts"
const appDir = path.join(projectRoot, 'ppl-workout');

// Configuration
const config = {
  rootDir: appDir,  // Point to ppl-workout directory
  entryPoint: 'index.html',
  checkExtensions: ['.html', '.js', '.css', '.json'],
  ignorePatterns: [
    'node_modules',
    '.git',
    '.github',
    '.vscode',
    'dist',
    'build'
  ],
  checkRemoteUrls: false,
  verbose: true,
  // Add template handling configuration
  templateHandling: {
    enabled: true,
    variables: {
      phase: ['1', '2', '3'],
      week: ['1', '2', '3', '4', '5', '6'],
      e: ['1', '2', '3'],      // Minified version of phase
      t: ['1', '2', '3', '4', '5', '6']  // Minified version of week
    },
    knownTemplates: [
      '../../dev/exercise-data/phase${phase}-week${week}.json',
      '/ppl-workout/dev/exercise-data/phase${phase}-week${week}.json',
      '../../dev/exercise-data/phase${e}-week${t}.json',
      '/ppl-workout/dev/exercise-data/phase${e}-week${t}.json'
    ]
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
if (args.includes('--ignore-templates')) {
  config.templateHandling.enabled = false;
}
if (args.includes('--verbose')) {
  config.verbose = true;
}
if (args.includes('--help')) {
  console.log(`
PWA Path Checker - Usage:
  node path-checker.js [options]

Options:
  --ignore-templates   Disable template path special handling
  --verbose            Show more detailed output
  --help               Show this help message
  `);
  process.exit(0);
}

// Stats
const stats = {
  scannedFiles: 0,
  scannedPaths: 0,
  validPaths: 0,
  invalidPaths: 0,
  warnings: 0,
  fileTypes: {}
};

// Store all found issues for reporting
const issues = [];

// Store all found paths for de-duplication
const foundPaths = new Set();

/**
 * Logs a message to the console with color
 * @param {string} message - The message to log
 * @param {string} type - The type of message (info, success, warning, error)
 */
function log(message, type = 'info') {
  const colors = {
    info: chalk.blue,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
    highlight: chalk.cyan
  };
  
  const color = colors[type] || colors.info;
  console.log(color(message));
}

/**
 * Check if a file exists and is readable
 * @param {string} filePath - The path to check
 * @returns {boolean} True if the file exists and is readable
 */
function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Resolve a relative path based on a source file
 * @param {string} sourcePath - The source file path
 * @param {string} targetPath - The target path to resolve
 * @returns {string} The resolved absolute path
 */
function resolvePath(sourcePath, targetPath) {
  // Handle absolute paths
  if (targetPath.startsWith('/')) {
    return path.join(config.rootDir, targetPath.slice(1));
  }
  
  // Handle relative paths
  const sourceDir = path.dirname(sourcePath);
  return path.join(sourceDir, targetPath);
}

/**
 * Extract paths from an HTML file
 * @param {string} filePath - The path to the HTML file
 * @returns {Array} Array of found paths and their contexts
 */
function extractPathsFromHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(content);
  const document = dom.window.document;
  const paths = [];
  
  // Check <script> src attributes
  document.querySelectorAll('script[src]').forEach(script => {
    paths.push({
      path: script.getAttribute('src'),
      context: 'script src',
      line: getLineNumber(content, script.outerHTML)
    });
  });
  
  // Check <link> href attributes
  document.querySelectorAll('link[href]').forEach(link => {
    paths.push({
      path: link.getAttribute('href'),
      context: `link ${link.getAttribute('rel') || 'href'}`,
      line: getLineNumber(content, link.outerHTML)
    });
  });
  
  // Check <img> src attributes
  document.querySelectorAll('img[src]').forEach(img => {
    paths.push({
      path: img.getAttribute('src'),
      context: 'image src',
      line: getLineNumber(content, img.outerHTML)
    });
  });
  
  // Check <a> href attributes
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href && !href.startsWith('#') && !href.includes('://')) {
      paths.push({
        path: href,
        context: 'anchor href',
        line: getLineNumber(content, a.outerHTML)
      });
    }
  });
  
  // Check inline styles with url()
  const cssURLs = extractCSSUrls(content);
  cssURLs.forEach(url => {
    paths.push({
      path: url.path,
      context: 'css url()',
      line: url.line
    });
  });
  
  // Check fetch() calls
  const jsURLs = extractJSUrls(content);
  jsURLs.forEach(url => {
    paths.push({
      path: url.path,
      context: 'fetch/XMLHttpRequest',
      line: url.line
    });
  });
  
  return paths;
}

/**
 * Extract paths from a JavaScript file
 * @param {string} filePath - The path to the JavaScript file
 * @returns {Array} Array of found paths and their contexts
 */
function extractPathsFromJS(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const paths = [];
  
  // Find fetch() calls
  const fetchRegex = /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = fetchRegex.exec(content)) !== null) {
    paths.push({
      path: match[1],
      context: 'fetch()',
      line: getLineNumber(content, match[0])
    });
  }
  
  // Find import statements
  const importRegex = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;
  while ((match = importRegex.exec(content)) !== null) {
    paths.push({
      path: match[1],
      context: 'import',
      line: getLineNumber(content, match[0])
    });
  }
  
  // Find require statements
  const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    paths.push({
      path: match[1],
      context: 'require()',
      line: getLineNumber(content, match[0])
    });
  }
  
  // Find URL strings
  const urlRegex = /['"`](\.\/|\.\.|\/)[^'"`\s]*\.(js|css|html|json|png|jpg|jpeg|gif|svg|webp|mp3|mp4|wav|ogg|pdf)['"`]/g;
  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[0].slice(1, -1);
    paths.push({
      path: url,
      context: 'string path',
      line: getLineNumber(content, match[0])
    });
  }
  
  return paths;
}

/**
 * Extract paths from a CSS file
 * @param {string} filePath - The path to the CSS file
 * @returns {Array} Array of found paths and their contexts
 */
function extractPathsFromCSS(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return extractCSSUrls(content).map(url => ({
    ...url,
    context: 'css url()'
  }));
}

/**
 * Extract CSS urls from content
 * @param {string} content - The content to search
 * @returns {Array} Array of found URLs with line numbers
 */
function extractCSSUrls(content) {
  const urls = [];
  const urlRegex = /url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/g;
  
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    urls.push({
      path: match[1],
      line: getLineNumber(content, match[0])
    });
  }
  
  return urls;
}

/**
 * Extract JavaScript URLs from content
 * @param {string} content - The content to search
 * @returns {Array} Array of found URLs with line numbers
 */
function extractJSUrls(content) {
  const urls = [];
  const fetchRegex = /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g;
  
  let match;
  while ((match = fetchRegex.exec(content)) !== null) {
    urls.push({
      path: match[1],
      line: getLineNumber(content, match[0])
    });
  }
  
  return urls;
}

/**
 * Get the line number for a string in content
 * @param {string} content - The content to search
 * @param {string} searchString - The string to find
 * @returns {number} The line number (1-based)
 */
function getLineNumber(content, searchString) {
  const index = content.indexOf(searchString);
  if (index === -1) return -1;
  
  return content.substring(0, index).split('\n').length;
}

/**
 * Checks if a path is a template literal and evaluates it with sample values
 * @param {string} path - The path that might contain template literals
 * @returns {Object} Result with isTemplate flag and sample paths
 */
function checkTemplatePath(path) {
  if (!config.templateHandling.enabled) {
    return { isTemplate: false };
  }
  
  // Check if path contains template literals ${...}
  const templateVarRegex = /\${([^}]+)}/g;
  const matches = [...path.matchAll(templateVarRegex)];
  
  if (matches.length === 0) {
    return { isTemplate: false };
  }
  
  // Check if it's a known template
  if (config.templateHandling.knownTemplates.includes(path)) {
    return {
      isTemplate: true,
      isKnown: true,
      variableNames: matches.map(match => match[1])
    };
  }
  
  // Extract variable names
  const varNames = matches.map(match => match[1]);
  const samplePaths = [];
  
  // Generate a few sample paths with variable combinations
  try {
    // Get first value for each variable as a simple sample
    const samplePath = path.replace(templateVarRegex, (match, varName) => {
      const values = config.templateHandling.variables[varName];
      if (!values || values.length === 0) {
        return match; // Keep original if no values defined
      }
      return values[0]; // Use first value
    });
    
    samplePaths.push(samplePath);
    
    // If there are only a few variables, generate all combinations
    if (varNames.length <= 2) {
      // Generate a few more combinations for testing
      const generateCombinations = (index, currentPath) => {
        if (index >= varNames.length) {
          if (!samplePaths.includes(currentPath)) {
            samplePaths.push(currentPath);
          }
          return;
        }
        
        const varName = varNames[index];
        const values = config.templateHandling.variables[varName] || [];
        
        for (let i = 0; i < Math.min(values.length, 2); i++) {
          const newPath = currentPath.replace(
            new RegExp(`\\$\\{${varName}\\}`),
            values[i]
          );
          generateCombinations(index + 1, newPath);
        }
      };
      
      generateCombinations(0, path);
    }
    
    return {
      isTemplate: true,
      variableNames: varNames,
      samplePaths
    };
  } catch (error) {
    return {
      isTemplate: true,
      error: error.message
    };
  }
}

/**
 * Check a path from a source file
 * @param {string} sourcePath - The source file path
 * @param {object} pathInfo - Information about the path
 */
function checkPath(sourcePath, pathInfo) {
  const { path: targetPath, context, line } = pathInfo;
  stats.scannedPaths++;
  
  // Skip already checked paths
  const pathKey = `${sourcePath}:${targetPath}`;
  if (foundPaths.has(pathKey)) return;
  foundPaths.add(pathKey);
  
  // Skip remote URLs
  if (targetPath.includes('://') || targetPath.startsWith('//')) {
    if (config.checkRemoteUrls) {
      // TODO: Add remote URL checking capability
      log(`Remote URL: ${targetPath} (not checked)`, 'warning');
      stats.warnings++;
    }
    return;
  }
  
  // Skip data URLs
  if (targetPath.startsWith('data:')) {
    return;
  }
  
  // Skip anchors and javascript: URLs
  if (targetPath.startsWith('#') || targetPath.startsWith('javascript:')) {
    return;
  }
  
  // Check for template literals
  const templateCheck = checkTemplatePath(targetPath);
  if (templateCheck.isTemplate) {
    if (templateCheck.isKnown) {
      // It's a known template path, mark as valid
      if (config.verbose) {
        log(`✓ ${targetPath} (known template)`, 'success');
      }
      stats.validPaths++;
      return;
    }
    
    // Try to validate the template with sample values
    if (templateCheck.samplePaths && templateCheck.samplePaths.length > 0) {
      let anyValid = false;
      let allValid = true;
      
      for (const samplePath of templateCheck.samplePaths) {
        try {
          const resolvedPath = resolvePath(sourcePath, samplePath);
          if (fileExists(resolvedPath)) {
            anyValid = true;
          } else {
            allValid = false;
          }
        } catch (error) {
          allValid = false;
        }
      }
      
      if (anyValid) {
        if (config.verbose) {
          log(`✓ ${targetPath} (template with variables: ${templateCheck.variableNames.join(', ')})`, 'success');
        }
        stats.validPaths++;
        return;
      } else {
        // Report it as an issue but mark it differently
        const issue = {
          sourcePath,
          targetPath,
          resolvedPath: null,
          context: `${context} (template with variables: ${templateCheck.variableNames.join(', ')})`,
          line,
          isTemplate: true
        };
        issues.push(issue);
        
        log(`? ${sourcePath} (line ${line}): ${targetPath} => template path`, 'warning');
        stats.warnings++;
        return;
      }
    }
  }
  
  // Regular path checking (non-template)
  try {
    // Resolve the path
    const resolvedPath = resolvePath(sourcePath, targetPath);
    
    // Check if the path exists
    if (fileExists(resolvedPath)) {
      if (config.verbose) {
        log(`✓ ${targetPath}`, 'success');
      }
      stats.validPaths++;
    } else {
      const issue = {
        sourcePath,
        targetPath,
        resolvedPath,
        context,
        line
      };
      issues.push(issue);
      
      log(`✗ ${sourcePath} (line ${line}): ${targetPath} => ${resolvedPath}`, 'error');
      stats.invalidPaths++;
    }
  } catch (error) {
    log(`Error checking path ${targetPath} from ${sourcePath}: ${error.message}`, 'error');
    stats.invalidPaths++;
  }
}

/**
 * Checks a file for paths
 * @param {string} filePath - The path to check
 */
function checkFile(filePath) {
  stats.scannedFiles++;
  
  // Update file type stats
  const ext = path.extname(filePath).toLowerCase();
  stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
  
  // Extract paths based on file type
  let paths = [];
  if (ext === '.html') {
    paths = extractPathsFromHTML(filePath);
  } else if (ext === '.js') {
    paths = extractPathsFromJS(filePath);
  } else if (ext === '.css') {
    paths = extractPathsFromCSS(filePath);
  } else if (ext === '.json') {
    // Could parse JSON and look for paths, but skipping for now
  }
  
  // Check each path
  paths.forEach(pathInfo => {
    checkPath(filePath, pathInfo);
  });
}

/**
 * Scans a directory recursively
 * @param {string} dir - The directory to scan
 */
function scanDirectory(dir) {
  try {
    if (!fs.existsSync(dir)) {
      log(`Skipping non-existent directory: ${dir}`, 'warning');
      stats.warnings++;
      return;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      
      // Skip ignored patterns
      if (config.ignorePatterns.some(pattern => entryPath.includes(pattern))) {
        continue;
      }
      
      try {
        if (entry.isDirectory()) {
          scanDirectory(entryPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (config.checkExtensions.includes(ext)) {
            checkFile(entryPath);
          }
        }
      } catch (error) {
        log(`Error processing ${entryPath}: ${error.message}`, 'error');
        stats.warnings++;
      }
    }
  } catch (error) {
    log(`Error scanning directory ${dir}: ${error.message}`, 'error');
    stats.warnings++;
  }
}

/**
 * Checks the PWA manifest file
 */
function checkManifest() {
  const manifestPath = path.join(config.rootDir, 'manifest.json');
  if (!fileExists(manifestPath)) {
    log('PWA manifest.json not found!', 'error');
    issues.push({
      sourcePath: config.entryPoint,
      targetPath: 'manifest.json',
      resolvedPath: manifestPath,
      context: 'PWA manifest',
      line: -1
    });
    return;
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Check icons
    if (manifest.icons && Array.isArray(manifest.icons)) {
      manifest.icons.forEach(icon => {
        if (icon.src) {
          checkPath(manifestPath, {
            path: icon.src,
            context: 'manifest icon',
            line: -1
          });
        }
      });
    } else {
      log('PWA manifest is missing icons array!', 'warning');
      stats.warnings++;
    }
    
    // Check start_url
    if (manifest.start_url) {
      checkPath(manifestPath, {
        path: manifest.start_url,
        context: 'manifest start_url',
        line: -1
      });
    }
    
    // Check other URLs in the manifest
    ['scope', 'background_color', 'theme_color'].forEach(key => {
      if (manifest[key] && typeof manifest[key] === 'string' && manifest[key].startsWith('./')) {
        checkPath(manifestPath, {
          path: manifest[key],
          context: `manifest ${key}`,
          line: -1
        });
      }
    });
    
  } catch (error) {
    log(`Error parsing manifest.json: ${error.message}`, 'error');
    issues.push({
      sourcePath: 'manifest.json',
      targetPath: null,
      resolvedPath: null,
      context: 'JSON parse error',
      line: -1,
      error: error.message
    });
  }
}

/**
 * Checks the service worker
 */
function checkServiceWorker() {
  const swPath = path.join(config.rootDir, 'service-worker.js');
  if (!fileExists(swPath)) {
    log('Service worker not found at service-worker.js!', 'warning');
    stats.warnings++;
    return;
  }
  
  try {
    const content = fs.readFileSync(swPath, 'utf8');
    
    // Check for cache names
    const cacheNames = [];
    const cacheNameRegex = /cacheName\s*=\s*['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = cacheNameRegex.exec(content)) !== null) {
      cacheNames.push(match[1]);
    }
    
    // Look for files to cache
    const cacheRegex = /cache\.addAll\(\s*\[([\s\S]*?)\]\s*\)/g;
    while ((match = cacheRegex.exec(content)) !== null) {
      const cacheBlock = match[1];
      const urlRegex = /['"`]([^'"`]+)['"`]/g;
      let urlMatch;
      
      while ((urlMatch = urlRegex.exec(cacheBlock)) !== null) {
        checkPath(swPath, {
          path: urlMatch[1],
          context: 'service worker cache',
          line: getLineNumber(content, urlMatch[0])
        });
      }
    }
    
  } catch (error) {
    log(`Error checking service worker: ${error.message}`, 'error');
  }
}

/**
 * Generate a report of all issues
 */
function generateReport() {
  log('\n=== PWA Path Checker Report ===', 'highlight');
  log(`Scanned ${stats.scannedFiles} files`, 'info');
  log(`Checked ${stats.scannedPaths} paths`, 'info');
  log(`Valid paths: ${stats.validPaths}`, 'success');
  log(`Invalid paths: ${stats.invalidPaths}`, 'error');
  log(`Warnings: ${stats.warnings}`, 'warning');
  
  log('\nFile types scanned:', 'highlight');
  Object.entries(stats.fileTypes)
    .sort(([, countA], [, countB]) => countB - countA)
    .forEach(([ext, count]) => {
      log(`  ${ext || '(no extension)'}: ${count} files`);
    });
  
  if (issues.length > 0) {
    log('\nIssues found:', 'error');
    
    // Group issues by source file
    const issuesBySource = {};
    issues.forEach(issue => {
      const sourcePath = issue.sourcePath;
      if (!issuesBySource[sourcePath]) {
        issuesBySource[sourcePath] = [];
      }
      issuesBySource[sourcePath].push(issue);
    });
    
    Object.entries(issuesBySource).forEach(([sourcePath, sourceIssues]) => {
      log(`\n${sourcePath}:`, 'highlight');
      sourceIssues.forEach(issue => {
        const lineInfo = issue.line > 0 ? `line ${issue.line}` : '';
        // Use a different color for template issues
        const msgType = issue.isTemplate ? 'warning' : 'error';
        log(`  - ${issue.targetPath} (${issue.context}${lineInfo ? ', ' + lineInfo : ''})`, msgType);
      });
    });
    
    log('\nSuggested fixes:', 'highlight');
    
    // Group issues by type (template vs non-template)
    const templateIssues = issues.filter(issue => issue.isTemplate);
    const regularIssues = issues.filter(issue => !issue.isTemplate);
    
    // Handle regular issues
    regularIssues.forEach(issue => {
      log(`- Check path "${issue.targetPath}" in "${issue.sourcePath}"`, 'warning');
      
      // Suggest potential fixes
      const ext = path.extname(issue.targetPath);
      if (ext && issue.resolvedPath) {
        try {
          const files = fs.readdirSync(path.dirname(issue.resolvedPath) || config.rootDir)
            .filter(f => path.extname(f).toLowerCase() === ext.toLowerCase());
            
          if (files.length > 0) {
            log(`  Similar files in directory: ${files.join(', ')}`, 'info');
          }
        } catch (error) {
          // Directory might not exist
        }
      }
    });
    
    // Handle template issues separately
    if (templateIssues.length > 0) {
      log('\nTemplate paths:', 'highlight');
      log('The following paths contain variables and cannot be fully validated:', 'info');
      
      templateIssues.forEach(issue => {
        log(`- ${issue.targetPath} in ${issue.sourcePath}`, 'info');
        log(`  This path uses template literals and will be evaluated at runtime.`, 'info');
        log(`  To suppress this warning, add it to the knownTemplates list in the config.`, 'info');
      });
    }
  } else {
    log('\nNo issues found! Your PWA paths look good.', 'success');
  }
}

/**
 * Check if a directory exists and is readable
 * @param {string} dirPath - The directory path to check
 * @returns {boolean} True if the directory exists and is readable
 */
function checkDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    log(`Warning: Directory does not exist: ${dirPath}`, 'warning');
    return false;
  }
  return true;
}

function main() {
  log('Starting PWA Path Checker...', 'highlight');
  
  // Check if app directory exists
  if (!checkDirectoryExists(config.rootDir)) {
    log(`Error: Root directory not found: ${config.rootDir}`, 'error');
    return;
  }
  
  // Check the entry point first
  const entryPointPath = path.join(config.rootDir, config.entryPoint);
  if (!fileExists(entryPointPath)) {
    log(`Entry point ${config.entryPoint} not found!`, 'error');
    stats.warnings++;
    
    // Ask if we should continue anyway
    log('Continue scanning other files? (Ctrl+C to exit)', 'warning');
  } else {
    // Check the entry point
    checkFile(entryPointPath);
  }
  
  // Check the manifest.json
  checkManifest();
  
  // Check the service worker
  checkServiceWorker();
  
  // Scan the rest of the directory
  scanDirectory(config.rootDir);
  
  // Generate a report
  generateReport();
}

// Run the checker
main();