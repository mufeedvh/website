#!/usr/bin/env bun

/**
 * HTML Formatter for Zola-generated sites
 * 
 * This script formats all HTML files in the public directory to produce
 * clean, well-formatted HTML output.
 * 
 * Usage:
 *   bun format-html.js
 *   
 * Requirements:
 *   - bun
 *   - prettier
 *   
 * The script will:
 * 1. Find all HTML files in the public directory
 * 2. Format them using Prettier with specific HTML formatting rules
 * 3. Preserve the original functionality while making the source pristine
 */

import { promises as fs } from 'fs';
import path from 'path';
import prettier from 'prettier';

/**
 * Recursively finds all HTML files in a directory
 * @param {string} dir - Directory to search
 * @returns {Promise<string[]>} - Array of HTML file paths
 */
async function findHtmlFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                return findHtmlFiles(fullPath);
            } else if (entry.name.endsWith('.html')) {
                return fullPath;
            }
            return null;
        })
    );
    
    return files.flat().filter(file => file !== null);
}

/**
 * Formats an HTML file using Prettier
 * @param {string} filePath - Path to the HTML file
 */
async function formatHtmlFile(filePath) {
    try {
        // Read the file content
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Format using Prettier with specific HTML formatting options
        const formatted = await prettier.format(content, {
            parser: 'html',
            printWidth: 120,
            tabWidth: 4,
            useTabs: false,
            htmlWhitespaceSensitivity: 'css',
            bracketSameLine: false,
            singleAttributePerLine: false,
            vueIndentScriptAndStyle: false,
            embeddedLanguageFormatting: 'auto',
            proseWrap: 'preserve'
        });
        
        // Write the formatted content back
        await fs.writeFile(filePath, formatted, 'utf-8');
        console.log(`✅ Formatted: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error formatting ${filePath}:`, error.message);
    }
}

/**
 * Main function to format all HTML files in the public directory
 */
async function main() {
    const publicDir = path.join(process.cwd(), 'public');
    
    // Check if public directory exists
    try {
        await fs.access(publicDir);
    } catch {
        console.error('❌ Public directory not found. Make sure to run "zola build" first.');
        process.exit(1);
    }
    
    console.log('🔍 Finding HTML files in public directory...');
    const htmlFiles = await findHtmlFiles(publicDir);
    
    if (htmlFiles.length === 0) {
        console.log('⚠️  No HTML files found in public directory.');
        return;
    }
    
    console.log(`📝 Found ${htmlFiles.length} HTML files to format.`);
    
    // Format all HTML files
    await Promise.all(htmlFiles.map(formatHtmlFile));
    
    console.log('✨ HTML formatting complete!');
}

// Run the script
main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
}); 