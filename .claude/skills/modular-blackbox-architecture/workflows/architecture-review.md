# Architecture Review Workflow

**Purpose:** Evaluate system architecture against modular blackbox principles

**When to Use:**
- Starting a new project
- Reviewing existing system architecture
- Before major refactoring
- Architecture decision checkpoints

---

## Pre-Review Checklist

Before reviewing, gather:
- [ ] System diagram or module list
- [ ] Key API definitions/interfaces
- [ ] External dependency list
- [ ] Team structure (who owns what)

---

## Review Dimensions

### 1. Module Ownership Assessment

**Question:** Can each module be owned by ONE person?

**Evaluation:**
```
For each module, answer:
├── Can one person understand it completely? [YES/NO]
├── Can one person modify it without coordination? [YES/NO]
├── Is the boundary clear? [YES/NO]
└── Can you explain it in 5 minutes? [YES/NO]

Score: All YES = PASS | Any NO = needs splitting
```

**Red Flags:**
- "Multiple teams touch this code"
- "You need to understand X to modify Y"
- "There's tribal knowledge required"

**Fix:** Split module along clear boundaries until single-person ownership is achievable.

---

### 2. Blackbox Boundary Check

**Question:** Are modules truly blackboxes?

**Evaluation:**
```
For each module boundary:
├── Is internal state exposed? [NO = GOOD]
├── Do callers depend on implementation details? [NO = GOOD]
├── Is there a clear API/interface? [YES = GOOD]
└── Can implementation change without breaking callers? [YES = GOOD]
```

**Red Flags:**
- Direct access to internal data structures
- Callers assuming implementation details
- No clear interface definition
- "You need to know how it works internally"

**Fix:** Add explicit interface layer, hide internals behind API.

---

### 3. External Dependency Audit

**Question:** Are ALL external dependencies wrapped?

**Evaluation:**
```
List all external dependencies:
├── Third-party libraries
├── External services/APIs
├── Platform/OS calls
├── Framework dependencies

For each:
├── Is it wrapped? [YES/NO]
├── Can you swap implementations? [YES/NO]
└── Are direct calls scattered through codebase? [NO = GOOD]
```

**Red Flags:**
- Direct calls to external libraries throughout code
- Framework-specific code in business logic
- Inability to mock/test without real external

**Fix:** Create wrapper layers for each external dependency.

---

### 4. API Future-Proofing

**Question:** Are APIs designed for unimplemented features?

**Evaluation:**
```
For each API:
├── Can new capabilities be added without signature changes? [YES = GOOD]
├── Are there extension points? [YES = GOOD]
├── Will future features require breaking changes? [NO = GOOD]
└── Is it designed for TODAY or for 5 YEARS? [5 YEARS = GOOD]
```

**Red Flags:**
- "We'll redesign this when we need feature X"
- Tight coupling to current requirements only
- No room for evolution

**Fix:** Add extension points, use configuration objects over parameter lists.

---

### 5. Format Design Quality

**Question:** Are data formats simple and implementable?

**Evaluation:**
```
For each format (API payloads, file formats, protocols):
├── Can a junior dev implement it completely? [YES = GOOD]
├── Is there ONE way to do things? [YES = GOOD]
├── Are there optional fields that complicate implementation? [FEW = GOOD]
└── Is the spec under 10 pages? [YES = GOOD]
```

**Red Flags:**
- "Nobody implements the full spec"
- Multiple ways to achieve same result
- Complex optional features
- Large specification documents

**Fix:** Simplify, remove options, make one canonical approach.

---

### 6. Plugin Architecture Direction

**Question:** Does the system accept plugins or live in someone else's world?

**Evaluation:**
```
├── Is this system a plugin to another framework? [NO = BETTER]
├── Can this system accept plugins? [YES = GOOD]
├── Who controls the architecture? [YOU = GOOD]
└── Can you swap the "host" framework? [YES = GOOD]
```

**Red Flags:**
- "We're a plugin to X framework"
- "The framework dictates our structure"
- Lock-in to external architecture

**Fix:** Invert control - build system that accepts plugins, not as plugin.

---

## Review Report Template

```markdown
# Architecture Review: [System Name]

**Date:** YYYY-MM-DD
**Reviewer:** [Name]

## Summary

| Dimension | Status | Score |
|-----------|--------|-------|
| Module Ownership | PASS/FAIL | X/4 |
| Blackbox Boundaries | PASS/FAIL | X/4 |
| External Dependencies | PASS/FAIL | X/3 |
| API Future-Proofing | PASS/FAIL | X/4 |
| Format Design | PASS/FAIL | X/4 |
| Plugin Architecture | PASS/FAIL | X/4 |

## Critical Issues

1. [Issue with highest impact]
2. [Second highest impact issue]

## Recommendations

### Immediate (This Sprint)
- [ ] Action 1
- [ ] Action 2

### Short-term (This Quarter)
- [ ] Action 3
- [ ] Action 4

### Long-term (Strategic)
- [ ] Action 5

## Detailed Findings

### Module Ownership
[Details]

### Blackbox Boundaries
[Details]

### External Dependencies
[Details]

### API Future-Proofing
[Details]

### Format Design
[Details]

### Plugin Architecture
[Details]
```

---

## Quick Review (5-Minute Version)

For rapid assessment, answer these 6 questions:

1. **Can one person own each module?** → If no, split it
2. **Are internals hidden?** → If no, add interfaces
3. **Are externals wrapped?** → If no, add wrappers
4. **Can APIs grow without breaking?** → If no, redesign
5. **Is the format simple?** → If no, simplify
6. **Do YOU control the architecture?** → If no, invert control
