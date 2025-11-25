# PAI Extension Pattern

**How to extend PAI with custom context hooks without modifying core files**

> **New to PAI?** Start with [GETTING_STARTED.md](./GETTING_STARTED.md), then [FORKING_AND_PERSONALIZING.md](./FORKING_AND_PERSONALIZING.md)

---

## Overview

PAI supports **context extension hooks** that allow you to inject custom context based on your environment without modifying core project files. This enables:

- **Project-specific context** (load different context for work vs personal projects)
- **Repository-specific rules** (apply coding standards for specific repos)
- **Domain-specific knowledge** (inject healthcare, finance, or security context)
- **Clean separation** (keep personal/work customizations separate from core PAI)

This pattern uses the **Template Method + Hooks** design pattern to allow extensibility without core modifications.

---

## The Pattern

### Architecture

```
Session Start
    ↓
Core Context Hook (always runs)
    ├─→ Loads CORE/SKILL.md
    ├─→ Loads identity.md with template substitution
    └─→ Injects personalized context
    ↓
Extension Context Hook (conditional)
    ├─→ Detects environment (directory, git remote, env vars)
    ├─→ If detected: Load extension skill
    ├─→ If not detected: Exit silently
    └─→ Injects domain-specific context
```

### How It Works

1. **Create custom skill** with domain knowledge
2. **Create detection hook** that auto-loads skill when environment matches
3. **Register hook** in settings.json SessionStart hooks
4. **Never modify** core PAI files

---

## Reference Implementation: K Health Context

### Example: Work Project Context Hook

**File:** `~/.claude/hooks/load-khealth-context.ts` (Reference implementation)

This hook demonstrates the complete pattern:

```typescript
#!/usr/bin/env bun

/**
 * load-khealth-context.ts
 *
 * Auto-loads K Health work context when working in K Health projects
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { SKILLS_DIR } from './lib/pai-paths';

/**
 * Detection function - customize for your environment
 */
function detectKHealth(): { detected: boolean; reason: string } {
  const cwd = process.cwd();

  // Method 1: Directory path detection
  if (cwd.includes('/Projects/k-health/')) {
    return { detected: true, reason: `Working directory: ${cwd}` };
  }

  // Method 2: Git remote detection
  try {
    const remote = execSync('git remote -v 2>/dev/null', { encoding: 'utf-8' });
    if (remote.includes('gitlab.com:khealth/')) {
      return { detected: true, reason: 'Git remote matches gitlab.com:khealth/' };
    }
  } catch {
    // Not in git repo - that's fine
  }

  return { detected: false, reason: 'No K Health indicators found' };
}

async function main() {
  try {
    // Skip for subagent sessions
    const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
    const isSubagent = claudeProjectDir.includes('/.claude/agents/') ||
                      process.env.CLAUDE_AGENT_TYPE !== undefined;

    if (isSubagent) {
      process.exit(0);
    }

    // Detect environment
    const detection = detectKHealth();

    if (!detection.detected) {
      console.error('ℹ️  Not in K Health environment - skipping');
      process.exit(0);
    }

    console.error(`🏥 K Health detected: ${detection.reason}`);

    // Load skill content
    const skillPath = join(SKILLS_DIR, 'khealth-context/SKILL.md');

    if (!existsSync(skillPath)) {
      console.error(`⚠️  Skill not found: ${skillPath}`);
      process.exit(0); // Graceful failure
    }

    const content = readFileSync(skillPath, 'utf-8');

    // Inject context via system-reminder
    const message = `<system-reminder>
K HEALTH CONTEXT (Auto-detected at Session Start)

Detection: ${detection.reason}

${content}
</system-reminder>`;

    console.log(message);
    console.error('✅ K Health context loaded');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(0); // Never fail the session
  }
}

main();
```

---

## Creating Your Own Extension Hook

### Step 1: Create Your Domain Skill

**File:** `~/.claude/skills/your-domain/SKILL.md`

```markdown
---
name: your-domain
description: |
  Your custom domain expertise.

  This skill is auto-loaded by load-your-domain-context.ts hook.
---

# Your Domain Context

## Project Overview
[Your project details]

## Coding Standards
- Standard 1
- Standard 2

## Security Requirements
- Requirement 1
- Requirement 2

## Common Workflows
[Your workflows]
```

### Step 2: Create Detection Hook

**File:** `~/.claude/hooks/load-your-domain-context.ts`

```typescript
#!/usr/bin/env bun

/**
 * load-your-domain-context.ts
 *
 * Auto-loads your domain context when detected
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { SKILLS_DIR } from './lib/pai-paths';

/**
 * Customize this detection logic for your environment
 */
function detectYourDomain(): { detected: boolean; reason: string } {
  const cwd = process.cwd();

  // Method 1: Directory pattern
  if (cwd.includes('/your-projects/')) {
    return { detected: true, reason: `Working directory: ${cwd}` };
  }

  // Method 2: Git remote pattern
  try {
    const remote = execSync('git remote -v 2>/dev/null', { encoding: 'utf-8' });
    if (remote.includes('github.com/your-org/')) {
      return { detected: true, reason: 'Git remote matches your-org' };
    }
  } catch {}

  // Method 3: Environment variable
  if (process.env.YOUR_DOMAIN_ACTIVE === 'true') {
    return { detected: true, reason: 'YOUR_DOMAIN_ACTIVE env var set' };
  }

  // Method 4: Marker file
  if (existsSync(join(cwd, '.your-domain-project'))) {
    return { detected: true, reason: 'Marker file .your-domain-project found' };
  }

  return { detected: false, reason: 'Not in your domain environment' };
}

async function main() {
  try {
    // Skip for subagents
    const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
    const isSubagent = claudeProjectDir.includes('/.claude/agents/') ||
                      process.env.CLAUDE_AGENT_TYPE !== undefined;

    if (isSubagent) {
      process.exit(0);
    }

    // Detect environment
    const detection = detectYourDomain();

    if (!detection.detected) {
      // Not your domain - exit silently
      process.exit(0);
    }

    console.error(`🎯 Your domain detected: ${detection.reason}`);

    // Load skill
    const skillPath = join(SKILLS_DIR, 'your-domain/SKILL.md');

    if (!existsSync(skillPath)) {
      console.error(`⚠️  Skill not found: ${skillPath}`);
      process.exit(0);
    }

    const content = readFileSync(skillPath, 'utf-8');

    // Inject context
    const message = `<system-reminder>
YOUR DOMAIN CONTEXT (Auto-loaded)

Detection: ${detection.reason}

${content}
</system-reminder>`;

    console.log(message);
    console.error('✅ Your domain context loaded');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(0); // Never fail the session
  }
}

main();
```

### Step 3: Register Hook

**File:** `~/.claude/settings.json`

Add to SessionStart hooks (AFTER load-core-context.ts):

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
            "command": "${PAI_DIR}/hooks/load-your-domain-context.ts"
          }
        ]
      }
    ]
  }
}
```

### Step 4: Make Hook Executable

```bash
chmod +x ~/.claude/hooks/load-your-domain-context.ts
```

---

## Detection Methods

### Method 1: Directory Path

**Best for:** Local project organization

```typescript
function detect(): boolean {
  const cwd = process.cwd();
  return cwd.includes('/specific/path/');
}
```

**Examples:**
- `/Projects/work/` - Work projects
- `/Projects/personal/drones/` - Drone projects
- `/code/client-projects/` - Client work

### Method 2: Git Remote

**Best for:** Repository-based detection

```typescript
function detect(): boolean {
  try {
    const remote = execSync('git remote -v', { encoding: 'utf-8' });
    return remote.includes('github.com/your-org/');
  } catch {
    return false;
  }
}
```

**Examples:**
- `gitlab.com:khealth/` - Company GitLab
- `github.com/your-company/` - Organization repos
- `bitbucket.org/team/` - Team repositories

### Method 3: Environment Variable

**Best for:** Explicit activation

```typescript
function detect(): boolean {
  return process.env.MY_CONTEXT_ACTIVE === 'true';
}
```

**Usage:**
```bash
# Activate for session
export MY_CONTEXT_ACTIVE=true

# Or in settings.json
{
  "env": {
    "MY_CONTEXT_ACTIVE": "true"
  }
}
```

### Method 4: Marker File

**Best for:** Per-project opt-in

```typescript
function detect(): boolean {
  return existsSync(join(process.cwd(), '.my-context'));
}
```

**Usage:**
```bash
# Add marker to project
touch .my-context

# Context auto-loads when in this directory
```

### Method 5: Combined Detection

**Best for:** Flexible, reliable detection

```typescript
function detect(): { detected: boolean; reason: string } {
  const cwd = process.cwd();

  // Check 1: Directory
  if (cwd.includes('/work/')) {
    return { detected: true, reason: 'Work directory' };
  }

  // Check 2: Git remote
  try {
    const remote = execSync('git remote -v', { encoding: 'utf-8' });
    if (remote.includes('work.com')) {
      return { detected: true, reason: 'Work repository' };
    }
  } catch {}

  // Check 3: Environment
  if (process.env.WORK_MODE === 'true') {
    return { detected: true, reason: 'WORK_MODE enabled' };
  }

  return { detected: false, reason: 'Not work environment' };
}
```

---

## Use Cases

### 1. Work vs Personal Projects

**Hook:** `load-work-context.ts`

**Detection:**
- Directory: `/work/` or `/company-projects/`
- Git: `github.com/company/`

**Context:**
- Company coding standards
- Internal documentation links
- Security policies
- Team conventions

### 2. Domain-Specific Expertise

**Hook:** `load-healthcare-context.ts`

**Detection:**
- Directory: `/healthcare/`
- Marker file: `.hipaa-compliance`

**Context:**
- HIPAA compliance rules
- Healthcare terminology
- Security requirements
- Audit logging requirements

### 3. Client Projects

**Hook:** `load-client-context.ts`

**Detection:**
- Directory: `/clients/CLIENT_NAME/`
- Git: `github.com/CLIENT_NAME/`

**Context:**
- Client preferences
- Project specifications
- Coding standards
- Deployment procedures

### 4. Technology Stack

**Hook:** `load-rust-context.ts`

**Detection:**
- File exists: `Cargo.toml`
- Directory: Rust project structure

**Context:**
- Rust best practices
- Cargo commands
- Testing patterns
- Common crates

---

## Best Practices

### 1. Graceful Failure

**Always exit gracefully** if context can't be loaded:

```typescript
if (!existsSync(skillPath)) {
  console.error(`⚠️  Skill not found: ${skillPath}`);
  process.exit(0); // Don't fail - just skip
}
```

**Never** throw errors that break session start.

### 2. Clear Detection Logging

**Report what was detected:**

```typescript
console.error(`🎯 Domain detected: ${detection.reason}`);
console.error(`📚 Loading context from: ${skillPath}`);
console.error(`✅ Context loaded (${content.length} characters)`);
```

### 3. Skip Subagents

**Subagents don't need extension context:**

```typescript
const isSubagent = process.env.CLAUDE_PROJECT_DIR?.includes('/.claude/agents/') ||
                  process.env.CLAUDE_AGENT_TYPE !== undefined;

if (isSubagent) {
  process.exit(0);
}
```

### 4. Multiple Detection Methods

**Use 2-3 detection methods** for reliability:

```typescript
// Primary: Directory path (fast, reliable)
if (cwd.includes('/work/')) return true;

// Secondary: Git remote (reliable for repos)
if (remote.includes('company.com')) return true;

// Tertiary: Environment variable (explicit control)
if (process.env.WORK_MODE) return true;
```

### 5. Specific vs Generic

**Be specific in detection, generic in error handling:**

```typescript
// ✅ Specific detection
if (cwd.includes('/Projects/k-health/')) {
  return { detected: true, reason: 'K Health project directory' };
}

// ✅ Generic error handling
if (!existsSync(skillPath)) {
  console.error(`⚠️  Skill not found`);
  process.exit(0); // Don't specify which skill in error
}
```

---

## Complete Example: Custom Work Context

### Step-by-Step Implementation

#### 1. Create Work Skill

**File:** `~/.claude/skills/work-context/SKILL.md`

```markdown
---
name: work-context
description: |
  Work project context and conventions.

  Auto-loaded by load-work-context.ts when in work projects.
---

# Work Context

## Company Standards

- TypeScript with strict mode
- 100% test coverage required
- Code review before merge
- Semantic versioning

## Security Requirements

- No secrets in code
- All APIs behind authentication
- Audit logging required
- GDPR compliance

## Deployment

- Staging: staging.company.com
- Production: app.company.com
- CI/CD: GitHub Actions

## Team Contacts

- Lead: lead@company.com
- DevOps: devops@company.com
```

#### 2. Create Detection Hook

**File:** `~/.claude/hooks/load-work-context.ts`

```typescript
#!/usr/bin/env bun

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { SKILLS_DIR } from './lib/pai-paths';

function detectWork(): { detected: boolean; reason: string } {
  const cwd = process.cwd();

  // Check directory
  if (cwd.includes('/work/') || cwd.includes('/company-projects/')) {
    return { detected: true, reason: `Work directory: ${cwd}` };
  }

  // Check git remote
  try {
    const remote = execSync('git remote -v 2>/dev/null', { encoding: 'utf-8' });
    if (remote.includes('github.com/company/')) {
      return { detected: true, reason: 'Company repository' };
    }
  } catch {}

  return { detected: false, reason: 'Not work environment' };
}

async function main() {
  try {
    // Skip subagents
    const isSubagent = process.env.CLAUDE_PROJECT_DIR?.includes('/.claude/agents/') ||
                      process.env.CLAUDE_AGENT_TYPE !== undefined;
    if (isSubagent) process.exit(0);

    // Detect
    const detection = detectWork();
    if (!detection.detected) process.exit(0);

    console.error(`💼 Work environment detected: ${detection.reason}`);

    // Load skill
    const skillPath = join(SKILLS_DIR, 'work-context/SKILL.md');
    if (!existsSync(skillPath)) {
      console.error(`⚠️  Work context skill not found`);
      process.exit(0);
    }

    const content = readFileSync(skillPath, 'utf-8');

    // Inject
    console.log(`<system-reminder>
WORK CONTEXT (Auto-loaded)

${content}
</system-reminder>`);

    console.error('✅ Work context loaded');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(0);
  }
}

main();
```

#### 3. Make Executable

```bash
chmod +x ~/.claude/hooks/load-work-context.ts
```

#### 4. Register in Settings

**File:** `~/.claude/settings.json`

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

#### 5. Test Detection

```bash
# Navigate to work project
cd ~/work/my-project

# Start Claude Code session
# You should see:
# 💼 Work environment detected: Work directory: /Users/you/work/my-project
# ✅ Work context loaded
```

---

## Advanced Patterns

### Template Substitution in Extension Skills

You can use the same template pattern in your extension skills:

**In your skill file:**
```markdown
# My Work Context

- User: {{USER_NAME}}
- Team: {{WORK_TEAM}}
- Project: {{WORK_PROJECT}}
```

**In your hook:**
```typescript
import { USER_NAME } from './lib/pai-identity';

const WORK_TEAM = process.env.WORK_TEAM || 'Engineering';
const WORK_PROJECT = process.env.WORK_PROJECT || 'Unknown';

// Perform substitution
let content = readFileSync(skillPath, 'utf-8');
content = content
  .replace(/\{\{USER_NAME\}\}/g, USER_NAME)
  .replace(/\{\{WORK_TEAM\}\}/g, WORK_TEAM)
  .replace(/\{\{WORK_PROJECT\}\}/g, WORK_PROJECT);
```

### Conditional Loading Based on Multiple Factors

```typescript
function shouldLoadContext(): boolean {
  const cwd = process.cwd();
  const isWorkDir = cwd.includes('/work/');
  const isWorkHours = new Date().getHours() >= 9 && new Date().getHours() <= 17;
  const isWorkday = new Date().getDay() >= 1 && new Date().getDay() <= 5;

  // Only load work context during work hours on workdays
  return isWorkDir && isWorkHours && isWorkday;
}
```

### Dynamic Content Selection

```typescript
function getSkillPath(): string {
  const cwd = process.cwd();

  // Load different context based on project type
  if (cwd.includes('/frontend/')) {
    return join(SKILLS_DIR, 'work-context/frontend.md');
  } else if (cwd.includes('/backend/')) {
    return join(SKILLS_DIR, 'work-context/backend.md');
  } else {
    return join(SKILLS_DIR, 'work-context/SKILL.md');
  }
}
```

---

## Why This Pattern Works

### Benefits

1. **Zero Core Modifications**
   - Core PAI files remain untouched
   - Clean upstream sync
   - PR-ready for Daniel

2. **Environment-Aware**
   - Context loads automatically when needed
   - No manual skill activation
   - Seamless context switching

3. **Composable**
   - Multiple extension hooks can coexist
   - Each hook handles specific domain
   - Hooks run in sequence

4. **Maintainable**
   - Extension logic isolated in hooks
   - Skill content separate from detection
   - Easy to add/remove/modify

5. **Forkable**
   - Others can replicate pattern
   - Template for custom contexts
   - Well-documented approach

### Design Principles

- **Template Method Pattern:** Core defines extension points, extensions implement specifics
- **Hooks Pattern:** Extension hooks register for lifecycle events
- **Dependency Injection:** Skills injected at runtime based on environment
- **Graceful Degradation:** System works without extensions, enhanced with them

---

## Troubleshooting

### Hook Not Running

**Check:**
```bash
# Verify hook is executable
ls -l ~/.claude/hooks/load-your-domain-context.ts

# Should show: -rwxr-xr-x (executable flag)

# Make executable if needed
chmod +x ~/.claude/hooks/load-your-domain-context.ts
```

### Context Not Loading

**Debug:**
```bash
# Run hook manually to see errors
bun run ~/.claude/hooks/load-your-domain-context.ts

# Check for detection output
# Should show detection logic results
```

### Wrong Context Loading

**Verify detection logic:**
```bash
# Test detection in target directory
cd ~/your-project
bun run ~/.claude/hooks/load-your-domain-context.ts

# Should show detection reason if successful
```

---

## Migration Guide

### Converting Hardcoded Context to Extension Pattern

**Before (Hardcoded in CORE):**
```markdown
# In CORE/SKILL.md:
- Company: Acme Corp
- Standards: Java Spring Boot
- Deployment: AWS ECS
```

**After (Extension Hook):**

1. Move to custom skill:
   ```markdown
   # skills/acme-work-context/SKILL.md
   - Company: Acme Corp
   - Standards: Java Spring Boot
   - Deployment: AWS ECS
   ```

2. Create detection hook:
   ```typescript
   // hooks/load-acme-context.ts
   function detectAcme() {
     return cwd.includes('/acme-projects/');
   }
   ```

3. Register hook in settings.json

4. Remove from CORE/SKILL.md

---

## Real-World Examples

### Healthcare Compliance (K Health Pattern)

```typescript
// Detection: K Health repositories
if (cwd.includes('/k-health/') ||
    remote.includes('khealth')) {

  // Load HIPAA compliance context
  // Load healthcare terminology
  // Load patient data handling rules
}
```

### Defense Projects (Drone Pattern)

```typescript
// Detection: Defense work
if (cwd.includes('/drones/') ||
    existsSync('.defense-project')) {

  // Load operational security context
  // Load military standards
  // Load safety-critical code practices
}
```

### Client Consulting

```typescript
// Detection: Per-client contexts
const client = cwd.match(/\/clients\/([^\/]+)\//)?.[1];

if (client) {
  // Load client-specific skill
  const skillPath = join(SKILLS_DIR, `client-${client}/SKILL.md`);
  // Load client preferences, standards, contacts
}
```

---

## Extension Hook Template

**Copy this template to create new extension hooks:**

```typescript
#!/usr/bin/env bun

/**
 * load-YOURNAME-context.ts
 * Auto-loads YOURNAME context when detected
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { SKILLS_DIR } from './lib/pai-paths';

function detectYOURNAME(): { detected: boolean; reason: string } {
  const cwd = process.cwd();

  // TODO: Add your detection logic
  if (cwd.includes('/YOUR_PATH/')) {
    return { detected: true, reason: `Working directory: ${cwd}` };
  }

  return { detected: false, reason: 'Not in YOURNAME environment' };
}

async function main() {
  try {
    // Skip subagents
    const isSubagent = process.env.CLAUDE_PROJECT_DIR?.includes('/.claude/agents/') ||
                      process.env.CLAUDE_AGENT_TYPE !== undefined;
    if (isSubagent) process.exit(0);

    // Detect
    const detection = detectYOURNAME();
    if (!detection.detected) process.exit(0);

    console.error(`🎯 YOURNAME detected: ${detection.reason}`);

    // Load skill
    const skillPath = join(SKILLS_DIR, 'YOURNAME-context/SKILL.md');
    if (!existsSync(skillPath)) {
      console.error(`⚠️  YOURNAME skill not found`);
      process.exit(0);
    }

    const content = readFileSync(skillPath, 'utf-8');

    // Inject
    console.log(`<system-reminder>
YOURNAME CONTEXT (Auto-loaded)

${content}
</system-reminder>`);

    console.error('✅ YOURNAME context loaded');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(0);
  }
}

main();
```

---

## Key Takeaways

1. **Extension hooks = zero core modifications**
2. **Detection logic = when to load context**
3. **Skills = what context to load**
4. **Graceful failure = system never breaks**
5. **Template pattern = reusable for any domain**

**This pattern enables unlimited PAI extensibility while keeping core files clean and PR-ready.**

---

## Related Documentation

**Getting Started:**
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Quick 5-minute setup
- [FORKING_AND_PERSONALIZING.md](./FORKING_AND_PERSONALIZING.md) - Configure identity and customize

**Architecture:**
- [CONSTITUTION.md](../.claude/skills/CORE/CONSTITUTION.md) - PAI architecture and principles
- [PAI_CONTRACT.md](../PAI_CONTRACT.md) - What PAI guarantees

**Reference:**
- `hooks/` - All hook implementations
- `.pai-protected.json` - Personal data protection patterns
