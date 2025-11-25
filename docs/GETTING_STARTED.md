# Getting Started with PAI

**Get PAI running in 5 minutes**

---

## Prerequisites (1 minute)

### Install Bun

```bash
# Install Bun (PAI's package manager)
curl -fsSL https://bun.sh/install | bash

# Restart your terminal or source your profile
source ~/.bashrc  # or ~/.zshrc
```

### Install Claude Code

Follow the installation instructions at [code.claude.com](https://code.claude.com)

---

## Installation (2 minutes)

### 1. Clone PAI

```bash
git clone https://github.com/danielmiessler/Personal_AI_Infrastructure.git
cd Personal_AI_Infrastructure
```

### 2. Configure Environment

```bash
# Copy environment template
cp .claude/.env.example .claude/.env

# Edit with your API keys
nano .claude/.env  # or use your preferred editor

# Required: ANTHROPIC_API_KEY
# Optional: Add other API keys for specific skills
```

### 3. Install to Your System

**Option A: Copy (recommended for beginners)**
```bash
# Copy .claude directory to home
cp -r .claude ~/.claude
```

**Option B: Symlink (for development)**
```bash
# Symlink for live updates
ln -s $(pwd)/.claude ~/.claude
```

---

## First Run (1 minute)

### Start Claude Code

```bash
# PAI loads automatically
claude-code
```

The CORE skill loads at session start via the `SessionStart` hook.

### Try These Commands

```
"What skills are available?"
"Show me my stack preferences"
"What agents do I have access to?"
"Read the CONSTITUTION"
```

---

## What is PAI? (1 minute)

### The Three Primitives

**1. Skills** (`.claude/skills/`)
- Self-contained AI capabilities
- Auto-activate based on your request
- Package routing, workflows, and documentation

**2. Agents** (`.claude/agents/`)
- Specialized AI personalities
- Engineer, researcher, designer, pentester, etc.
- Each has unique voice and capabilities

**3. Hooks** (`.claude/hooks/`)
- Event-driven automation
- Capture work, provide voice feedback, manage state
- Run automatically on session start/stop, tool use, etc.

---

## Next Steps

**Ready to personalize PAI?**
→ Read [FORKING_AND_PERSONALIZING.md](./FORKING_AND_PERSONALIZING.md) to configure your identity and create custom skills

**Full documentation:**
→ See [README.md](../README.md) for complete documentation index
→ See [CONSTITUTION.md](../.claude/skills/CORE/CONSTITUTION.md) for system architecture

---

**You now have PAI running! The system will use generic defaults ("User", "Assistant") until you personalize it.**
