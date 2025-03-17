/**
 * JavaScript & CSS Minifier
 * Automatically minifies all JS and CSS files in the assets directory
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify as minifyJS } from 'terser';
import CleanCSS from 'clean-css';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..'); // Go up one level from "dev scripts" to project root
const appDir = path.join(rootDir, 'ppl-workout');

// Config
const config = {
  js: {
    sourceDir: path.join(appDir, 'assets/js'),
    // Skip already minified files
    skipPattern: /\.min\.js$/
  },
  css: {
    sourceDir: path.join(appDir, 'assets/css'),
    skipPattern: /\.min\.css$/
  }
};

/**
 * Create .min version of a file
 * @param {string} filePath - Source file path
 * @param {function} minifyFn - Minification function
 */
async function createMinifiedVersion(filePath, minifyFn) {
  try {
    // Check if file should be skipped
    const fileName = path.basename(filePath);
    const isJS = path.extname(filePath).toLowerCase() === '.js';
    const skipPattern = isJS ? config.js.skipPattern : config.css.skipPattern;
    
    if (skipPattern.test(fileName)) {
      console.log(`Skipping already minified file: ${fileName}`);
      return;
    }
    
    // Read the source file
    const source = fs.readFileSync(filePath, 'utf8');
    
    // Create the minified file name
    const dirName = path.dirname(filePath);
    const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
    const minFileName = `${fileNameWithoutExt}.min${path.extname(fileName)}`;
    const minFilePath = path.join(dirName, minFileName);
    
    // Minify and save
    const minified = await minifyFn(source, filePath);
    fs.writeFileSync(minFilePath, minified);
    
    // Output the size reduction
    const originalSize = Buffer.byteLength(source, 'utf8');
    const minifiedSize = Buffer.byteLength(minified, 'utf8');
    const reduction = 100 - (minifiedSize / originalSize * 100);
    
    console.log(`Minified ${fileName} → ${minFileName} (${reduction.toFixed(1)}% reduction)`);
  } catch (error) {
    console.error(`Error minifying ${filePath}: ${error.message}`);
  }
}

/**
 * Minify JavaScript with Terser
 * @param {string} source - Source code
 * @returns {Promise<string>} - Minified code
 */
async function minifyJavaScript(source) {
  const result = await minifyJS(source, {
    compress: {
      drop_console: false,
      drop_debugger: true
    },
    mangle: true
  });
  
  return result.code;
}

/**
 * Minify CSS with CleanCSS
 * @param {string} source - Source CSS
 * @returns {Promise<string>} - Minified CSS
 */
async function minifyCSS(source) {
  const result = new CleanCSS({
    level: 2,
    format: 'keep-breaks'
  }).minify(source);
  
  return result.styles;
}

/**
 * Process all files in a directory
 * @param {string} dir - Directory to process
 * @param {function} processor - Processing function
 */
async function processDirectory(dir, processor) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(entryPath, processor);
    } else if (entry.isFile()) {
      await processor(entryPath);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting minification...');
  
  // Process JS files
  console.log('\nMinifying JavaScript files:');
  await processDirectory(config.js.sourceDir, async (filePath) => {
    if (path.extname(filePath).toLowerCase() === '.js') {
      await createMinifiedVersion(filePath, minifyJavaScript);
    }
  });
  
  // Process CSS files
  console.log('\nMinifying CSS files:');
  await processDirectory(config.css.sourceDir, async (filePath) => {
    if (path.extname(filePath).toLowerCase() === '.css') {
      await createMinifiedVersion(filePath, minifyCSS);
    }
  });
  
  console.log('\nMinification complete!');
}

main().catch(error => {
  console.error('Error during minification:', error);
  process.exit(1);
});