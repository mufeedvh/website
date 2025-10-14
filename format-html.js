#!/usr/bin/env bun


import { promises as fs } from 'fs';
import path from 'path';
import prettier from 'prettier';

async function findWebFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                return findWebFiles(fullPath);
            } else if (entry.name.endsWith('.html') || entry.name.endsWith('.css') || entry.name.endsWith('.js')) {
                return fullPath;
            }
            return null;
        })
    );
    
    return files.flat().filter(file => file !== null);
}

async function formatWebFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const ext = path.extname(filePath).toLowerCase();
        
        let config;
        switch (ext) {
            case '.html':
                config = {
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
                };
                break;
            case '.css':
                config = {
                    parser: 'css',
                    printWidth: 120,
                    tabWidth: 4,
                    useTabs: false,
                    singleQuote: false,
                    semi: true
                };
                break;
            case '.js':
                config = {
                    parser: 'babel',
                    printWidth: 120,
                    tabWidth: 4,
                    useTabs: false,
                    singleQuote: true,
                    semi: true,
                    trailingComma: 'es5',
                    bracketSpacing: true,
                    arrowParens: 'avoid'
                };
                break;
            default:
                console.log(`⚠️  Skipping unsupported file type: ${filePath}`);
                return;
        }
        
        const formatted = await prettier.format(content, config);
        
        await fs.writeFile(filePath, formatted, 'utf-8');
        console.log(`✅ Formatted: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error formatting ${filePath}:`, error.message);
    }
}

async function main() {
    const publicDir = path.join(process.cwd(), 'public');
    
    try {
        await fs.access(publicDir);
    } catch {
        console.error('❌ Public directory not found. Make sure to run "zola build" first.');
        process.exit(1);
    }
    
    console.log('🔍 Finding web files (HTML, CSS, JS) in public directory...');
    const webFiles = await findWebFiles(publicDir);
    
    if (webFiles.length === 0) {
        console.log('⚠️  No web files found in public directory.');
        return;
    }
    
    console.log(`📝 Found ${webFiles.length} web files to format.`);
    
    await Promise.all(webFiles.map(formatWebFile));
    
    console.log('✨ Web file formatting complete!');
}

main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
}); 