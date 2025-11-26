# Forking and Customizing PAI

**Complete guide to making PAI your own Personal AI Infrastructure**

---

## Overview

PAI (Personal AI Infrastructure) is designed to be forked and customized. This guide shows you how to:
1. Fork the repository
2. Configure your personal identity
3. Add custom context (like k-health-context pattern)
4. Keep your fork in sync with upstream

---

## Quick Start (5 Minutes)

### 1. Fork the Repository

```bash
# Clone PAI to your machine
git clone https://github.com/danielmiessler/Personal_AI_Infrastructure.git ~/.claude
cd ~/.claude

# Add your own remote (optional)
git remote add myfork https://github.com/YOUR_USERNAME/Personal_AI_Infrastructure.git
```

### 2. Configure Your Identity

Edit `~/.claude/settings.json` and add your personal details to the `env` block:

```json
{
  "env": {
    "PAI_USER_NAME": "Your Full Name",
    "PAI_AGENT_NAME": "Your Assistant Name",
    "PAI_USER_EMAIL": "your.email@example.com",
    "PAI_USER_LOCATION_CITY": "Your City",
    "PAI_USER_LOCATION_COUNTRY": "Your Country",
    "PAI_USER_TIMEZONE": "Your Timezone",
    "PAI_USER_ROLE": "Your Job Title",
    "PAI_USER_ORGANIZATION": "Your Company",
    "PAI_VOICE_ID": "your_elevenlabs_voice_id"
  }
}
```

**See `.claude/.env.example` for complete list of configuration options.**

### 3. Restart Claude Code

```bash
# Restart Claude Code to load your new configuration
# Your personalized PAI is ready!
```

---

## Understanding the Configuration System

### How It Works

PAI uses a **template substitution system** that separates core code from personal data:

1. **Core Files** (committed to git):
   - `skills/CORE/SKILL.md` - System configuration (de-personalized)
   - `skills/CORE/CONSTITUTION.md` - Architecture docs (de-personalized)
   - `skills/CORE/identity.md` - Identity template with `{{VARIABLES}}`
   - `agents/*.md` - Agent definitions (de-personalized)

2. **Personal Configuration** (your customization):
   - `settings.json` env block - Your PAI_* environment variables
   - These values fill in the `{{VARIABLES}}` in identity.md at session start

3. **Runtime** (session start):
   - `load-core-context.ts` hook reads identity.md
   - Substitutes `{{USER_NAME}}` → your PAI_USER_NAME value
   - Injects personalized context into session

### Template Variables

Available template variables in `identity.md`:

| Variable | Required | Example | Default |
|----------|----------|---------|---------|
| `{{AGENT_NAME}}` | Yes | "Jarvis" | "Assistant" |
| `{{USER_NAME}}` | Yes | "Tony Stark" | "User" |
| `{{USER_EMAIL}}` | No | "tony@stark.com" | "" |
| `{{USER_LOCATION_CITY}}` | No | "Malibu" | "" |
| `{{USER_LOCATION_COUNTRY}}` | No | "USA" | "" |
| `{{USER_LOCATION}}` | No | "Malibu, USA" | "" |
| `{{USER_TIMEZONE}}` | No | "Pacific Time" | "" |
| `{{USER_ROLE}}` | No | "CEO" | "" |
| `{{USER_ORGANIZATION}}` | No | "Stark Industries" | "" |
| `{{VOICE_ID}}` | No | "elevenlabs_id" | "" |

---

## Advanced Customization

### Adding Custom Context Hooks

PAI supports **extension hooks** for project-specific context (like k-health-context pattern).

**Example: Work Project Context**

1. **Create custom context hook:**
   ```bash
   # Create hook file
   touch ~/.claude/hooks/load-work-context.ts
   chmod +x ~/.claude/hooks/load-work-context.ts
   ```

2. **Implement detection and loading:**
   ```typescript
   #!/usr/bin/env bun
   // load-work-context.ts

   import { existsSync } from 'fs';
   import { execSync } from 'child_process';

   // Detect if we're in a work project
   const cwd = process.cwd();
   const isWorkProject = cwd.includes('/work/') ||
                         existsSync(`${cwd}/.work-project`);

   if (!isWorkProject) {
     process.exit(0); // Not a work project, skip
   }

   // Load work-specific context
   console.log(`<system-reminder>
   WORK PROJECT CONTEXT

   Current directory: ${cwd}

   - Use company coding standards
   - Reference internal documentation
   - Apply security policies
   </system-reminder>`);
   ```

3. **Register hook in settings.json:**
   ```json
   {
     "hooks": {
       "SessionStart": [
         {
           "hooks": [
             {
               "type": "command",
               "command": "${PAI_DIR}/hooks/load-core-context.ts"
             },
             {
               "type": "command",
               "command": "${PAI_DIR}/hooks/load-work-context.ts"
             }
           ]
         }
       ]
     }
   }
   ```

**See `EXTENSION_PATTERN.md` for complete guide on creating custom context hooks.**

### Customizing Skills

Create your own domain-specific skills:

```bash
mkdir ~/.claude/skills/my-domain
```

```markdown
---
name: my-domain
description: |
  My custom domain expertise.

  USE WHEN user says 'my domain task', 'custom workflow'.
---

# My Domain Skill

## Workflows

### Task 1
1. Step 1
2. Step 2
```

Skills auto-activate based on natural language triggers in the `description` field.

### Customizing Agents

Modify agent personalities in `~/.claude/agents/*.md`:

```markdown
---
name: my-engineer
voice_id: your_elevenlabs_voice_id
---

# My Custom Engineer

Custom instructions for your engineering agent...
```

---

## Keeping Your Fork Synced

### Sync with Upstream

```bash
# Add upstream remote (one-time)
git remote add upstream https://github.com/danielmiessler/Personal_AI_Infrastructure.git

# Fetch latest changes
git fetch upstream

# Merge upstream changes
git merge upstream/main

# Resolve any conflicts (usually in settings.json)
```

### Handling Conflicts

**Common conflict: `settings.json`**

Your personal env vars vs upstream changes:

```bash
# Keep your personal env vars
git checkout --ours settings.json

# Or manually merge both versions
```

**Best Practice:**
- Keep personal customizations in: `settings.json` env block, `identity.md`
- Core files should match upstream (SKILL.md, CONSTITUTION.md, agents/*.md)

---

## File Organization

### What to Commit (Your Fork)

✅ **Commit these:**
- `settings.json` (with your personal env vars)
- Custom skills in `skills/your-domain/`
- Custom hooks in `hooks/your-custom-hook.ts`
- Custom agents in `agents/your-agent.md`

❌ **Don't commit these:**
- `history/` - Personal learnings and sessions
- `scratchpad/` - Temporary working files
- `.env` - API keys and secrets
- `plans/` - Personal planning documents

*These are already in `.gitignore`*

### What to Customize

**Core files (inherit from upstream):**
- `.claude/skills/CORE/SKILL.md` - System config (update from upstream)
- `.claude/skills/CORE/CONSTITUTION.md` - Architecture (update from upstream)
- `.claude/skills/CORE/identity.md` - Template (update from upstream)
- `.claude/agents/*.md` - Agent definitions (update from upstream)

**Personal files (your customization):**
- `.claude/settings.json` - Your env vars, hook configurations
- `.claude/hooks/load-*-context.ts` - Your custom context hooks
- `.claude/skills/your-domain/` - Your custom skills

---

## Troubleshooting

### Issue: Identity Not Loading

**Symptom:** Session shows "User" and "Assistant" instead of your configured names.

**Solution:**
1. Check `settings.json` has PAI_USER_NAME and PAI_AGENT_NAME in env block
2. Restart Claude Code
3. Check terminal output for "⚠️  PAI Identity not configured" warning

### Issue: Template Variables Not Substituting

**Symptom:** Identity.md shows `{{USER_NAME}}` instead of actual name.

**Solution:**
1. Verify `load-core-context.ts` has template substitution logic
2. Check hooks/lib/pai-identity.ts exists and exports variables
3. Run: `bun run ~/.claude/hooks/load-core-context.ts` to test

### Issue: Upstream Merge Conflicts

**Symptom:** Git conflicts when merging upstream changes.

**Solution:**
```bash
# Accept upstream for core files
git checkout upstream/main -- .claude/skills/CORE/SKILL.md
git checkout upstream/main -- .claude/skills/CORE/CONSTITUTION.md

# Keep your settings.json
git checkout --ours .claude/settings.json

# Commit merge
git commit -m "Merge upstream changes, keep personal config"
```

---

## Migration from Old PAI

If you have an existing PAI installation with hardcoded values:

### Step 1: Backup Your Data

```bash
cp -r ~/.claude ~/.claude.backup
```

### Step 2: Update Core Files

```bash
# Pull latest de-personalized core files
git pull upstream main

# Your settings.json will have conflicts - resolve by keeping your env vars
```

### Step 3: Convert Personal Data to Env Vars

Extract your personal data from old files and add to `settings.json`:

```json
{
  "env": {
    "PAI_USER_NAME": "extracted from old identity.md",
    "PAI_AGENT_NAME": "extracted from old SKILL.md",
    // ... other values
  }
}
```

### Step 4: Verify Configuration

```bash
# Restart Claude Code
# Check session start output shows your personalized name
```

---

## Best Practices

1. **Separation of Concerns**
   - Core code stays generic (update from upstream)
   - Personal data goes in env vars (your customization)
   - Custom workflows go in personal skills

2. **Version Control**
   - Commit your customizations to your fork
   - Pull upstream updates regularly
   - Keep personal and upstream changes separate

3. **Security**
   - Never commit API keys (use .env)
   - Review .gitignore before pushing
   - Use .pai-protected.json patterns for validation

4. **Documentation**
   - Document your custom skills
   - Add comments to custom hooks
   - Keep README updated with your setup

---

## Next Steps

- **Read:** `EXTENSION_PATTERN.md` - Learn k-health-context pattern
- **Read:** `CONSTITUTION.md` - Understand PAI architecture
- **Explore:** Create your first custom skill
- **Join:** Share your customizations with the community

---

**You now have a fully personalized PAI that stays in sync with upstream improvements!**
