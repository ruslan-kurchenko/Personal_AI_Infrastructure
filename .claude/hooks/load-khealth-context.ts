#!/usr/bin/env bun

/**
 * load-khealth-context.ts
 *
 * Automatically loads K Health work context when working in K Health directories
 * or when git remote matches gitlab.com:khealth/*.
 *
 * Purpose:
 * - Auto-detect K Health project environment
 * - Load K Health skill context (project inventory, conventions, compliance)
 * - Only loads when detection criteria are met
 *
 * Detection Methods:
 * 1. Current working directory contains '/Projects/k-health/'
 * 2. Git remote URL matches 'gitlab.com:khealth/'
 *
 * Setup:
 * 1. Ensure ~/.claude/skills/khealth-context/SKILL.md exists
 * 2. Add this hook to settings.json SessionStart hooks (after load-core-context.ts)
 *
 * How it works:
 * - Runs at the start of every Claude Code session
 * - Skips execution for subagent sessions
 * - Checks if current environment is K Health related
 * - If detected, injects K Health context as <system-reminder>
 * - If not detected, exits silently (no context injected)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { SKILLS_DIR } from './lib/pai-paths';

/**
 * Detect if current environment is a K Health project
 */
function detectKHealth(): { detected: boolean; reason: string } {
  // Check 1: Current working directory
  const cwd = process.cwd();
  if (cwd.includes('/Projects/k-health/')) {
    return { detected: true, reason: `Working directory: ${cwd}` };
  }

  // Check 2: Git remote (if in git repo)
  try {
    const remote = execSync('git remote -v 2>/dev/null', { encoding: 'utf-8' });
    if (remote.includes('gitlab.com:khealth/') || remote.includes('gitlab.com/khealth/')) {
      return { detected: true, reason: 'Git remote matches gitlab.com:khealth/' };
    }
  } catch {
    // Not in a git repo or git not available - that's fine
  }

  return { detected: false, reason: 'No K Health indicators found' };
}

async function main() {
  try {
    // Check if this is a subagent session - if so, exit silently
    const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
    const isSubagent = claudeProjectDir.includes('/.claude/agents/') ||
                      process.env.CLAUDE_AGENT_TYPE !== undefined;

    if (isSubagent) {
      // Subagent sessions don't need K Health context loading
      process.exit(0);
    }

    // Detect if we're in a K Health environment
    const detection = detectKHealth();

    if (!detection.detected) {
      // Not a K Health environment - exit silently
      console.error('ℹ️  Not in K Health environment - skipping context loading');
      process.exit(0);
    }

    console.error(`🏥 K Health environment detected: ${detection.reason}`);

    // Get K Health skill path
    const khealthSkillPath = join(SKILLS_DIR, 'khealth-context/SKILL.md');

    // Verify K Health skill file exists
    if (!existsSync(khealthSkillPath)) {
      console.error(`⚠️  K Health skill not found at: ${khealthSkillPath}`);
      console.error(`💡 K Health context will not be loaded`);
      process.exit(0); // Don't fail - just skip loading
    }

    console.error('📚 Reading K Health context from skill file...');

    // Read the K Health SKILL.md file content
    const khealthContent = readFileSync(khealthSkillPath, 'utf-8');

    console.error(`✅ Read ${khealthContent.length} characters from K Health SKILL.md`);

    // Output the K Health content as a system-reminder
    // This will be injected into Claude's context at session start
    const message = `<system-reminder>
K HEALTH CONTEXT (Auto-detected at Session Start)

Detection reason: ${detection.reason}

The following K Health work context has been loaded from ${khealthSkillPath}:

---
${khealthContent}
---

This K Health context is now active for this session. Apply K Health conventions, security requirements, and HIPAA compliance awareness.
</system-reminder>`;

    // Write to stdout (will be captured by Claude Code)
    console.log(message);

    console.error('✅ K Health context injected into session');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in load-khealth-context hook:', error);
    // Don't fail the session - just skip K Health context
    process.exit(0);
  }
}

main();
