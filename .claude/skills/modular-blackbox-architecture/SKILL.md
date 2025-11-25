---
name: modular-blackbox-architecture
description: |
  Modular blackbox architecture and development methodology based on Eskil Steenberg's principles.
  Defines single-person-ownership modules, stable API design, format-first thinking, dependency wrapping,
  and decades-long software longevity patterns.

  USE WHEN user says "architecture review", "modular design", "blackbox architecture", "API design",
  "how to structure this system", "dependency management", "wrap this library", "format design",
  "platform abstraction", "plugin architecture", or any software architecture decision-making.
---

## Workflow Routing (SYSTEM PROMPT)

**When user requests architecture review or system structure:**
Examples: "review this architecture", "how should I structure this", "is this design modular", "architecture feedback"
→ **READ:** ~/.claude/skills/modular-blackbox-architecture/workflows/architecture-review.md
→ **EXECUTE:** Complete architecture review against blackbox principles

**When user requests API design guidance:**
Examples: "design this API", "API review", "is this API future-proof", "how to expose this functionality"
→ **READ:** ~/.claude/skills/modular-blackbox-architecture/workflows/api-design.md
→ **EXECUTE:** API design evaluation and recommendations

**When user requests dependency wrapping:**
Examples: "wrap this library", "how to wrap dependencies", "abstract this dependency", "platform layer"
→ **READ:** ~/.claude/skills/modular-blackbox-architecture/workflows/dependency-wrapping.md
→ **EXECUTE:** Dependency wrapping strategy and implementation

**When user requests format design:**
Examples: "design this format", "file format", "protocol design", "data format"
→ **READ:** ~/.claude/skills/modular-blackbox-architecture/workflows/format-design.md
→ **EXECUTE:** Format design with simplicity and implementation freedom principles

**When user requests migration strategy:**
Examples: "migrate this system", "gradual migration", "replace this component", "parallel operation"
→ **READ:** ~/.claude/skills/modular-blackbox-architecture/workflows/migration-strategy.md
→ **EXECUTE:** Glue code and parallel operation migration planning

---

## When to Activate This Skill

**Architecture Decision Making:**
- "How should I structure this system/project/codebase?"
- "Is this architecture modular enough?"
- "Architecture review", "design review"
- "Break this down into components"

**API Design:**
- "Design an API for X"
- "Is this API future-proof?"
- "How to expose this functionality?"
- "API stability concerns"

**Dependency Management:**
- "Should I wrap this library?"
- "How to abstract external dependencies?"
- "Create a platform layer"
- "Dependency isolation"

**Format & Protocol Design:**
- "Design a file format"
- "Protocol design"
- "Data interchange format"
- "Config format design"

**System Evolution:**
- "How to migrate this system?"
- "Replace component without breaking"
- "Parallel operation strategy"
- "Gradual replacement"

---

## Core Philosophy: The Eskil Steenberg Principles

### Foundational Truth

> "Every piece of software should be writable by one person through proper modularization and API design."

This isn't about small software. It's about architecture that scales through **independence**, not **coordination**.

---

## The 10 Commandments of Modular Blackbox Architecture

### 1. Single-Person Ownership

**Principle:** Every module should be comprehensible and maintainable by ONE person.

**Why:** Coordination overhead grows exponentially with team size. Modules that require multiple people to understand create bottlenecks.

**Implementation:**
- Size modules to fit in one person's head
- Clear boundaries = clear ownership
- If you can't explain the module in 5 minutes, it's too big

### 2. Blackbox Design

**Principle:** Modules are blackboxes. What they do is exposed ONLY through APIs or protocols.

**Why:** Implementation freedom. Internal changes never break dependents.

**Implementation:**
- Never expose internal state
- Document the API, not the implementation
- Header files/interfaces define the contract

### 3. Future-Proof APIs

**Principle:** "You never implement a good enough for now API. The API is the same."

**Why:** Breaking changes cascade. Future-ready APIs prevent rewrites.

**Implementation:**
- Design APIs for features you haven't implemented yet
- Think: what will this need in 5 years?
- Simple functions that can evolve without signature changes

### 4. Wrap Everything External

**Principle:** Even excellent external libraries should be wrapped.

**Why:** You don't control external code evolution. Wrapping maintains YOUR architectural control.

**Implementation:**
```
Your Code → Your Wrapper → External Library
```
Never: `Your Code → External Library (direct calls)`

### 5. Format Design is THE Skill

**Principle:** APIs, files, protocols, and languages are all FORMAT expressions.

**Why:** Format design determines software success more than implementation.

**Implementation:**
- Small, implementable formats beat feature-rich complex ones
- Constraints and guarantees reduce implementation burden
- One way to do things > multiple optional approaches

### 6. Simple Primitives That Generalize

**Principle:** Choose simple primitives that work across use cases over complex primitives for specific cases.

**Why:** Generalized primitives reveal that different domains share identical structural problems.

**Example:** A "clip" primitive works for video editing, audio editing, animation, and even non-media scheduling.

### 7. Recording for Testing

**Principle:** Build recording and playback into blackbox systems.

**Why:** Testing infrastructure comes FREE when you can record/replay inputs.

**Implementation:**
- Record all data flowing through core systems
- Enables time-travel debugging
- Creates perfect regression tests automatically

### 8. Platform Layers

**Principle:** Create platform abstraction layers for ALL external dependencies.

**Why:** Enables porting, testing, and future platform changes.

**Implementation:**
- Test applications that exercise ALL API functionality
- Platform layer wraps OS/environment specifics
- Test apps = proof of portability

### 9. Glue Code for Migration

**Principle:** Connect old and new systems with glue code for parallel operation.

**Why:** Eliminates catastrophic migration failures.

**Implementation:**
- Never big-bang rewrites
- Run old and new in parallel
- Glue code translates between systems
- Gradual traffic shifting

### 10. Plugin Architecture: Your World

**Principle:** "You don't want to live in somebody else's world. You want to live in YOUR world and accept other people into your world."

**Why:** Plugins that require living in external frameworks create coupling and lock-in.

**Implementation:**
- Design systems that ACCEPT plugins
- Don't build systems as plugins TO others
- Your architecture, your rules

---

## Quick Decision Framework

### "Should this be a separate module?"

```
Can one person own it completely?
├── YES → Is it a coherent concept?
│         ├── YES → Make it a module
│         └── NO → It might be too broad, split further
└── NO → Split it until yes
```

### "Should I wrap this dependency?"

```
Do you control the dependency's evolution?
├── YES (your code) → Direct use OK
└── NO (external library/service)
    └── ALWAYS WRAP IT
```

### "Is this API future-proof?"

```
Can you add new capabilities without changing signatures?
├── YES → Good API
└── NO → Redesign with extension points
```

### "Is this format well-designed?"

```
Can a junior developer implement it completely and correctly?
├── YES → Good format
└── NO → Simplify until yes
```

---

## Anti-Patterns to Avoid

### 1. Shared Mutable State
**Problem:** Modules that share state require coordination
**Fix:** Blackbox boundaries with message passing

### 2. Direct External Dependencies
**Problem:** External changes cascade through your system
**Fix:** Wrap ALL externals

### 3. Feature-Rich Complex Formats
**Problem:** Nobody implements them completely or correctly
**Fix:** Small, implementable specs

### 4. Multiple Optional Approaches
**Problem:** Everyone implements different subsets
**Fix:** One canonical way

### 5. Big-Bang Migrations
**Problem:** All-or-nothing = high risk
**Fix:** Glue code + parallel operation

### 6. Living in Someone Else's World
**Problem:** Framework coupling, lock-in
**Fix:** Your architecture accepts plugins

---

## Language and Platform Considerations

### Eskil's C89 Philosophy

> "Dependable C89 remains the most reliable language choice for software lasting decades."

**Why C89?**
- Compiles everywhere
- Will compile forever
- No breaking changes (unlike Python 2→3)
- Decades-long software lifespan

**For Modern Projects:**
- **TypeScript:** Good choice for web/Node (Walle preference)
- **Rust:** Good for systems where C would be used
- **Go:** Good for services/infrastructure
- Key: Choose stable languages for long-lived code

### Longevity Thinking

> "Jet fighters remain operational for ~50 years. Healthcare systems likely operate for ~50 years."

**Ask yourself:**
- Will this compile in 10 years?
- Will dependencies exist in 10 years?
- Can someone maintain this without you?

---

## Practical Workflow Integration

### For New Projects
1. Define module boundaries (single-person ownership)
2. Design APIs before implementation (future-proof)
3. Wrap ALL external dependencies
4. Build recording into core systems
5. Design formats for simplicity

### For Existing Projects
1. Identify largest coordination bottlenecks
2. Extract into blackbox modules incrementally
3. Add wrappers around direct external calls
4. Use glue code for gradual migration

### For Architecture Reviews
1. Check: Can modules be owned by one person?
2. Check: Are external dependencies wrapped?
3. Check: Are APIs designed for unimplemented features?
4. Check: Is format design simple and implementable?
5. Check: Does the system accept plugins or live in others' worlds?

---

## Source

Based on Eskil Steenberg's presentation at Better Software Conference.
Watch: https://www.youtube.com/watch?v=sSpULGNHyoI

**Key Quote:**
> "It's faster to write five lines of code today than to write one line today and then have to edit it in the future."

---

## Supplementary Resources

**Workflows:**
- `workflows/architecture-review.md` - Complete architecture evaluation checklist
- `workflows/api-design.md` - API design principles and evaluation
- `workflows/dependency-wrapping.md` - Wrapping strategy and patterns
- `workflows/format-design.md` - Format design methodology
- `workflows/migration-strategy.md` - Glue code and parallel migration

**Reference:**
- Original video transcript and insights extracted via Fabric
