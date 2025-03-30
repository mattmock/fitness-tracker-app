/**
 * Type Imports Tests
 * 
 * These tests verify that types are being imported correctly across the codebase.
 * They check that files are importing from the centralized type system rather
 * than from legacy locations.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Helper function to check imports in a file
function checkFileImports(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check for imports from centralized type system
  const hasTypeImport = /import.*from ['"].*\/types['"]/i.test(content) || 
                        /import.*from ['"].*\/types\/.*['"]/i.test(content);
  
  // Check for legacy imports (should not exist)
  const hasLegacyDbImport = /import.*\{.*(Exercise|Session|SessionExercise|Routine).*\}.*from ['"].*\/db\/services\/.*['"]/i.test(content);
  
  return {
    hasTypeImport,
    hasLegacyDbImport,
    content
  };
}

describe('Type Imports', () => {
  // Only running these in a CI environment to avoid file system dependencies in regular tests
  // Set FORCE_TYPE_IMPORT_TESTS=true to run these tests locally
  const shouldRunTests = process.env.CI === 'true' || process.env.FORCE_TYPE_IMPORT_TESTS === 'true';
  
  if (!shouldRunTests) {
    it('skips file system tests in non-CI environment', () => {
      console.log('Skipping type import tests. Set FORCE_TYPE_IMPORT_TESTS=true to run these tests locally');
      expect(true).toBe(true);
    });
    return;
  }
  
  // Collect the right import patterns across the codebase
  it('verifies service files import from centralized type system', async () => {
    const files = await glob('src/db/services/**/*.ts', { ignore: ['**/*.test.ts', '**/__tests__/**'] });
    
    const importResults = files.map(file => {
      const imports = checkFileImports(file);
      return {
        file,
        ...imports
      };
    });
    
    // Services should import from the centralized type system
    const servicesWithoutTypeImports = importResults.filter(r => !r.hasTypeImport);
    expect(servicesWithoutTypeImports).toEqual([]);
    
    // Services should not have legacy imports
    const servicesWithLegacyImports = importResults.filter(r => r.hasLegacyDbImport);
    expect(servicesWithLegacyImports).toEqual([]);
  });
  
  it('verifies UI components do not contain direct database type imports', async () => {
    const files = await glob('src/components/**/*.tsx', { ignore: ['**/*.test.tsx', '**/__tests__/**'] });
    
    const componentsWithLegacyImports = files
      .map(file => ({
        file,
        ...checkFileImports(file)
      }))
      .filter(r => r.hasLegacyDbImport);
    
    expect(componentsWithLegacyImports).toEqual([]);
  });
  
  it('verifies screens properly import from centralized type system', async () => {
    const files = await glob('src/screens/**/*.tsx', { ignore: ['**/*.test.tsx', '**/__tests__/**'] });
    
    const screensWithLegacyImports = files
      .map(file => ({
        file,
        ...checkFileImports(file)
      }))
      .filter(r => r.hasLegacyDbImport);
    
    expect(screensWithLegacyImports).toEqual([]);
  });
  
  it('ensures db/index.ts does not export types directly', () => {
    const dbIndexPath = path.resolve(process.cwd(), 'src/db/index.ts');
    const content = fs.readFileSync(dbIndexPath, 'utf-8');
    
    // The index file should not export type interfaces
    const exportsTypes = /export.*\{.*(Exercise|Session|SessionExercise|Routine).*\}/i.test(content);
    expect(exportsTypes).toBe(false);
  });
  
  it('ensures centralized types are used in test files', async () => {
    const files = await glob('src/**/__tests__/**/*.{ts,tsx}', { ignore: ['**/types/__tests__/**'] });
    
    // Test files that still use legacy imports
    const testsWithLegacyImports = files
      .map(file => ({
        file,
        ...checkFileImports(file)
      }))
      .filter(r => r.hasLegacyDbImport);
    
    // If this fails, tests need to be updated to use centralized types
    if (testsWithLegacyImports.length > 0) {
      console.warn('Tests that need updating to use centralized types:');
      testsWithLegacyImports.forEach(result => {
        console.warn(`- ${result.file}`);
      });
    }
    
    expect(testsWithLegacyImports).toEqual([]);
  });
}); 