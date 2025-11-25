#!/usr/bin/env bun
/**
 * PAI Protected Files Validator
 *
 * Validates files against .pai-protected.json patterns to prevent personal data leaks.
 * Run before committing changes to PAI repository.
 *
 * Usage:
 *   bun ~/Projects/PAI/.claude/hooks/validate-protected.ts
 *   bun ~/Projects/PAI/.claude/hooks/validate-protected.ts --staged  (check only staged files)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface ProtectionPattern {
  description: string;
  patterns: string[];
  exceptions?: string[];
}

interface ValidationRule {
  description: string;
  files: string[];
  must_not_contain?: string[];
  must_contain?: string[];
}

interface ProtectedManifest {
  version: string;
  description?: string;
  patterns?: {
    [category: string]: ProtectionPattern;
  };
  validation_rules?: {
    [ruleName: string]: ValidationRule;
  };
}

const PAI_ROOT = join(import.meta.dir, '../..');
const MANIFEST_PATH = join(PAI_ROOT, '.pai-protected.json');

// Colors for terminal output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function loadManifest(): ProtectedManifest {
  if (!existsSync(MANIFEST_PATH)) {
    console.error(`${RED}❌ Protected files manifest not found: ${MANIFEST_PATH}${RESET}`);
    process.exit(1);
  }

  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
}

function getStagedFiles(): string[] {
  try {
    const output = execSync('git diff --cached --name-only', {
      cwd: PAI_ROOT,
      encoding: 'utf-8'
    });
    return output.trim().split('\n').filter(f => f.length > 0);
  } catch {
    return [];
  }
}

function getAllProtectedFiles(manifest: ProtectedManifest): string[] {
  const files: string[] = [];

  // Get files from validation rules
  if (manifest.validation_rules) {
    for (const rule of Object.values(manifest.validation_rules)) {
      files.push(...rule.files);
    }
  }

  return [...new Set(files)]; // Remove duplicates
}

function matchesException(filePath: string, exceptions: string[] = []): boolean {
  return exceptions.some(pattern => {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '__DOUBLE_STAR__')
      .replace(/\*/g, '[^/]*')
      .replace(/__DOUBLE_STAR__/g, '.*');
    return new RegExp(regexPattern).test(filePath);
  });
}

function checkFileContent(filePath: string, manifest: ProtectedManifest): {
  valid: boolean;
  violations: string[];
} {
  const fullPath = join(PAI_ROOT, filePath);

  if (!existsSync(fullPath)) {
    return { valid: true, violations: [] };
  }

  try {
    const content = readFileSync(fullPath, 'utf-8');
    const violations: string[] = [];

    // Check pattern-based validations
    if (manifest.patterns) {
      for (const [category, config] of Object.entries(manifest.patterns)) {
        // Skip if file is in exceptions
        if (matchesException(filePath, config.exceptions)) {
          continue;
        }

        // Check each pattern
        for (const pattern of config.patterns) {
          try {
            const regex = new RegExp(pattern, 'gi');
            const matches = content.match(regex);

            if (matches) {
              violations.push(
                `${category}: Found "${matches[0]}" in non-exception file`
              );
            }
          } catch (error) {
            // Invalid regex - skip
          }
        }
      }
    }

    // Check validation rules
    if (manifest.validation_rules) {
      for (const [ruleName, rule] of Object.entries(manifest.validation_rules)) {
        // Check if this rule applies to this file
        const fileMatches = rule.files.some(pattern =>
          matchesException(filePath, [pattern])
        );

        if (!fileMatches) {
          continue;
        }

        // Check must_contain requirements
        if (rule.must_contain) {
          for (const required of rule.must_contain) {
            if (!content.includes(required)) {
              violations.push(
                `${ruleName}: Missing required "${required}"`
              );
            }
          }
        }

        // Check must_not_contain requirements
        if (rule.must_not_contain) {
          for (const forbidden of rule.must_not_contain) {
            if (content.includes(forbidden)) {
              violations.push(
                `${ruleName}: Found forbidden "${forbidden}"`
              );
            }
          }
        }
      }
    }

    return { valid: violations.length === 0, violations };
  } catch (error) {
    // Binary file or read error - skip
    return { valid: true, violations: [] };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const stagedOnly = args.includes('--staged');

  console.log(`\n${BLUE}🛡️  PAI Protected Files Validator${RESET}\n`);
  console.log('='.repeat(60));

  const manifest = loadManifest();

  // Determine which files to check
  let filesToCheck: string[];

  if (stagedOnly) {
    filesToCheck = getStagedFiles();

    if (filesToCheck.length === 0) {
      console.log(`\n${GREEN}✅ No files staged for commit${RESET}\n`);
      process.exit(0);
    }

    console.log(`\n${YELLOW}Checking ${filesToCheck.length} staged file(s) for personal data...${RESET}\n`);
  } else {
    // Check all git-tracked files
    try {
      const output = execSync('git ls-files', { cwd: PAI_ROOT, encoding: 'utf-8' });
      filesToCheck = output.trim().split('\n').filter(f => f.length > 0);
    } catch {
      console.error(`${RED}❌ Not in a git repository${RESET}`);
      process.exit(1);
    }

    console.log(`\n${YELLOW}Checking all ${filesToCheck.length} tracked files for personal data...${RESET}\n`);
  }

  let hasViolations = false;
  const results: { file: string; valid: boolean; violations: string[] }[] = [];

  // Check each file
  for (const file of filesToCheck) {
    const result = checkFileContent(file, manifest);
    results.push({ file, ...result });

    if (!result.valid) {
      hasViolations = true;
    }
  }

  // Print results
  for (const result of results) {
    if (result.valid) {
      console.log(`${GREEN}✅${RESET} ${result.file}`);
    } else {
      console.log(`${RED}❌${RESET} ${result.file}`);
      for (const violation of result.violations) {
        console.log(`   ${RED}→${RESET} ${violation}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));

  if (hasViolations) {
    console.log(`\n${RED}🚫 VALIDATION FAILED${RESET}\n`);
    console.log('Protected files contain content that should not be in public PAI.');
    console.log('\n' + YELLOW + 'Common fixes:' + RESET);
    console.log('  1. Remove API keys and secrets');
    console.log('  2. Remove personal email addresses');
    console.log('  3. Remove references to private Kai data');
    console.log('  4. Ensure PAI-specific files reference "PAI" not "Kai"');
    console.log('\n📖 See .pai-protected.json for details\n');
    process.exit(1);
  } else {
    console.log(`\n${GREEN}✅ All protected files validated successfully!${RESET}\n`);
    console.log('Safe to commit to PAI repository.\n');
    process.exit(0);
  }
}

main();
