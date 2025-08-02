/**
 * TypeScript to Scala Converter Script
 * 
 * This script recursively scans a directory for TypeScript declaration files (.d.ts)
 * and converts them to Scala.js compatible code using the convertTsToScala function.
 * 
 * Usage:
 *   node run.ts                                    # Use default folders (./samples -> ./output)
 *   INPUT_FOLDER=./input node run.ts              # Custom input folder
 *   OUTPUT_FOLDER=./converted node run.ts         # Custom output folder
 *   INPUT_FOLDER=./input OUTPUT_FOLDER=./converted node run.ts  # Both custom
 * 
 * Features:
 * - Recursively scans subdirectories
 * - Preserves directory structure in output
 * - Generates package names based on file paths
 * - Creates output directories automatically
 * - Reports conversion progress and success/failure counts
 * 
 * Configuration via environment variables:
 * - INPUT_FOLDER: Source directory containing .d.ts files (default: ./samples)
 * - OUTPUT_FOLDER: Destination directory for .scala files (default: ./output)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname, extname, basename } from 'path';
import { convertTsToScala } from './src/converter.ts';

// Configuration
const INPUT_FOLDER = process.env.INPUT_FOLDER || './samples';
const OUTPUT_FOLDER = process.env.OUTPUT_FOLDER || './output';

/**
 * Recursively find all .d.ts files in a directory
 */
function findTsFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively search subdirectories
        files.push(...findTsFiles(fullPath));
      } else if (stat.isFile() && entry.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return files;
}

/**
 * Convert a single TypeScript file to Scala
 */
function convertFile(inputPath: string, inputFolder: string, outputFolder: string): void {
  try {
    // Read the TypeScript file
    const tsContent = readFileSync(inputPath, 'utf-8');
    
    // Calculate relative path from input folder
    const relativePath = relative(inputFolder, inputPath);
    
    // Generate package name from file path (remove extension, replace separators)
    const packageName = relativePath
      .replace(/\.d\.ts$/, '')
      .replace(/[\/\\]/g, '.')
      .replace(/[^a-zA-Z0-9_.]/g, '_');
    
    // Convert TypeScript to Scala
    const scalaContent = convertTsToScala(tsContent, packageName);
    
    // Calculate output path
    const outputPath = join(outputFolder, relativePath.replace(/\.d\.ts$/, '.d.ts.scala'));
    
    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    mkdirSync(outputDir, { recursive: true });
    
    // Write the Scala file
    writeFileSync(outputPath, scalaContent, 'utf-8');
    
    console.log(`✅ Converted: ${relativePath} -> ${relative(process.cwd(), outputPath)}`);
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error);
  }
}

/**
 * Main function to convert all TypeScript files
 */
function main(): void {
  const inputFolder = join(process.cwd(), INPUT_FOLDER);
  const outputFolder = join(process.cwd(), OUTPUT_FOLDER);
  
  console.log(`🔍 Scanning for .d.ts files in: ${inputFolder}`);
  console.log(`📁 Output folder: ${outputFolder}`);
  console.log('');
  
  // Find all TypeScript declaration files
  const tsFiles = findTsFiles(inputFolder);
  
  if (tsFiles.length === 0) {
    console.log('⚠️  No .d.ts files found in the input folder.');
    return;
  }
  
  console.log(`📄 Found ${tsFiles.length} TypeScript declaration files:`);
  tsFiles.forEach(file => {
    console.log(`   - ${relative(inputFolder, file)}`);
  });
  console.log('');
  
  // Convert each file
  console.log('🔄 Converting files...');
  let successCount = 0;
  
  for (const tsFile of tsFiles) {
    try {
      convertFile(tsFile, inputFolder, outputFolder);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to convert ${tsFile}:`, error);
    }
  }
  
  console.log('');
  console.log(`✨ Conversion complete! ${successCount}/${tsFiles.length} files converted successfully.`);
  
  if (successCount < tsFiles.length) {
    process.exit(1);
  }
}

// Run the main function
main();