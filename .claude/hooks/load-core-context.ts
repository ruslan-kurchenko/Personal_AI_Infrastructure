#!/usr/bin/env bun

/**
 * load-core-context.ts
 *
 * Automatically loads your CORE skill context at session start by reading and injecting
 * the CORE SKILL.md AND identity.md files directly into Claude's context as a system-reminder.
 *
 * Purpose:
 * - Read CORE SKILL.md file content (system configuration)
 * - Read CORE identity.md file content (personal identity)
 * - Output combined content as system-reminder for Claude to process
 * - Ensure complete context (contacts, preferences, security, identity) available at session start
 * - Bypass skill activation logic by directly injecting context
 *
 * Setup:
 * 1. Customize your ~/.claude/skills/CORE/SKILL.md with system configuration
 * 2. Customize your ~/.claude/skills/CORE/identity.md with personal identity
 * 3. Add this hook to settings.json SessionStart hooks
 * 4. Ensure PAI_DIR environment variable is set (defaults to $HOME/.claude)
 *
 * How it works:
 * - Runs at the start of every Claude Code session
 * - Skips execution for subagent sessions (they don't need CORE context)
 * - Reads your CORE SKILL.md file AND identity.md file
 * - Injects combined content as <system-reminder> which Claude processes automatically
 * - Gives your AI immediate access to your complete personal context
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PAI_DIR, SKILLS_DIR } from './lib/pai-paths';

async function main() {
  try {
    // Check if this is a subagent session - if so, exit silently
    const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
    const isSubagent = claudeProjectDir.includes('/.claude/agents/') ||
                      process.env.CLAUDE_AGENT_TYPE !== undefined;

    if (isSubagent) {
      // Subagent sessions don't need CORE context loading
      console.error('🤖 Subagent session - skipping CORE context loading');
      process.exit(0);
    }

    // Get CORE skill paths using PAI paths library
    const coreSkillPath = join(SKILLS_DIR, 'CORE/SKILL.md');
    const identityPath = join(SKILLS_DIR, 'CORE/identity.md');

    // Verify CORE skill file exists
    if (!existsSync(coreSkillPath)) {
      console.error(`❌ CORE skill not found at: ${coreSkillPath}`);
      console.error(`💡 Ensure CORE/SKILL.md exists or check PAI_DIR environment variable`);
      process.exit(1);
    }

    console.error('📚 Reading CORE context from skill files...');

    // Read the CORE SKILL.md file content
    const coreContent = readFileSync(coreSkillPath, 'utf-8');
    console.error(`✅ Read ${coreContent.length} characters from CORE SKILL.md`);

    // Read the identity.md file content (optional - may not exist in all deployments)
    let identityContent = '';
    if (existsSync(identityPath)) {
      identityContent = readFileSync(identityPath, 'utf-8');
      console.error(`✅ Read ${identityContent.length} characters from identity.md`);
    } else {
      console.error(`ℹ️  identity.md not found - skipping personal identity context`);
    }

    // Build identity section if available
    const identitySection = identityContent ? `
--- PERSONAL IDENTITY (from ${identityPath}) ---
${identityContent}
---
` : '';

    // Output the CORE content as a system-reminder
    // This will be injected into Claude's context at session start
    const message = `<system-reminder>
PAI CORE CONTEXT (Auto-loaded at Session Start)

📅 CURRENT DATE/TIME: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} PST

The following context has been loaded from ${coreSkillPath}:

---
${coreContent}
---
${identitySection}
This context is now active for this session. Follow all instructions, preferences, and guidelines contained above.
</system-reminder>`;

    // Write to stdout (will be captured by Claude Code)
    console.log(message);

    console.error('✅ CORE context injected into session');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in load-core-context hook:', error);
    process.exit(1);
  }
}

main();
