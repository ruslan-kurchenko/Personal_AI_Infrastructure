# Format Design Workflow

**Purpose:** Design simple, implementable formats for APIs, files, protocols, and configurations

**When to Use:**
- Designing file formats
- Creating API payloads
- Defining protocols
- Planning configuration formats
- Any data interchange specification

---

## Core Philosophy

> "Format design is something that isn't really taught and I wish people would teach it."
> "It's better to implement one bad thing than implement one bad thing and a good thing. That's more work."

**Key Insight:** APIs, files, protocols, and languages are ALL format expressions. The same design principles apply to all.

---

## The Format Design Principles

### 1. Simplicity Over Features

**Principle:** Small, implementable formats beat feature-rich complex ones.

**Why:** Quality implementations matter more than theoretical capability coverage.

**Test:** Can a junior developer implement it completely and correctly in one day?

### 2. One Way To Do Things

**Principle:** Never provide multiple ways to achieve the same result.

**Why:** Supporting multiple options forces EVERYONE to implement ALL options.

```
❌ BAD: "You can use either JSON or XML"
   → Everyone must support both

✅ GOOD: "Use JSON"
   → One implementation, works everywhere
```

### 3. Constraints Enable Freedom

**Principle:** Constraints and guarantees in formats REDUCE implementation burden.

**Why:** Constraints eliminate edge cases developers must handle.

```
❌ BAD: "Field can be any string"
   → Must handle empty, null, unicode, length limits, injection...

✅ GOOD: "Field is 1-100 alphanumeric characters"
   → Simple validation, no edge cases
```

### 4. Implementation Freedom

**Principle:** Formats should not expose internal storage or processing decisions.

**Why:** Enables radical backend changes while preserving all integrations.

```
❌ BAD: { "internal_db_id": 12345 }
   → Leaks database implementation

✅ GOOD: { "id": "usr_abc123" }
   → Opaque identifier, any backend works
```

---

## Format Design Process

### Step 1: Define the Purpose

**Questions:**
- What data needs to be exchanged?
- Who will implement readers/writers?
- What's the skill level of implementers?
- How long will this format live?

### Step 2: List All Fields

Write down EVERY piece of information:
- Required fields
- Optional fields
- Metadata
- Extension points

### Step 3: Eliminate Optional Features

For each optional field, ask:
- Is this truly needed?
- Can it be required instead?
- Can it be removed entirely?

**Goal:** Minimize optionality.

### Step 4: Define Constraints

For each field:
- Type (string, number, boolean, enum)
- Range/length limits
- Character set restrictions
- Format patterns (regex)

### Step 5: Write the Specification

Document:
- Field definitions
- Constraints
- Examples (CRITICAL)
- Error cases

### Step 6: Implement BOTH Sides

Build:
- Writer/serializer
- Reader/parser
- Round-trip test (write → read → write = identical)

---

## Format Design Patterns

### 1. Envelope Pattern

Wrap payload in consistent envelope:

```json
{
  "version": "1.0",
  "type": "user.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    // Actual payload here
  }
}
```

**Benefits:**
- Version for evolution
- Type for routing
- Timestamp for debugging
- Data is isolated

### 2. Discriminated Union

Use type field for polymorphism:

```json
// Type 1
{ "type": "text", "content": "Hello" }

// Type 2
{ "type": "image", "url": "https://...", "width": 800, "height": 600 }

// Type 3
{ "type": "video", "url": "https://...", "duration": 120 }
```

**Benefits:**
- Clear differentiation
- Type-safe parsing
- Extensible (add new types)

### 3. Reference Pattern

Avoid embedding, use references:

```json
// ❌ BAD: Embedded (hard to update, duplicated data)
{
  "order": {
    "customer": {
      "name": "John",
      "email": "john@example.com",
      "address": { ... }
    }
  }
}

// ✅ GOOD: Reference
{
  "order": {
    "customer_id": "cust_abc123"
  }
}
```

**When to embed:**
- Data is immutable (order snapshot)
- Performance critical (avoid join)
- Data is owned by parent

### 4. Semantic Versioning for Formats

```json
{
  "format_version": "2.1.0",
  // 2 = breaking change
  // .1 = new optional field
  // .0 = documentation fix
}
```

---

## Format Anti-Patterns

### 1. Kitchen Sink Format

```json
// ❌ BAD: Everything optional, format for all use cases
{
  "data"?: any,
  "meta"?: any,
  "options"?: any,
  "legacy_data"?: any,
  "v2_data"?: any
}
```

**Problem:** Nobody implements it correctly because "correct" is undefined.

**Fix:** Separate formats for separate purposes.

### 2. Stringly-Typed Data

```json
// ❌ BAD: Everything is a string
{
  "user_id": "123",
  "is_active": "true",
  "created_at": "01-15-2024",
  "amount": "49.99"
}

// ✅ GOOD: Proper types
{
  "user_id": 123,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "amount": 4999
}
```

**Note:** Use integers for money (cents, not dollars).

### 3. Implicit Semantics

```json
// ❌ BAD: Meaning depends on context
{
  "status": 1  // What does 1 mean?
}

// ✅ GOOD: Explicit
{
  "status": "active"  // Self-documenting
}
```

### 4. Nested Optional Mayhem

```json
// ❌ BAD: Deep optional nesting
{
  "user"?: {
    "profile"?: {
      "settings"?: {
        "theme"?: string
      }
    }
  }
}
// Every level must check for null/undefined!

// ✅ GOOD: Flat, required, with defaults
{
  "theme": "dark"  // Always present, has default
}
```

---

## Format Specification Template

```markdown
# [Format Name] Specification

**Version:** 1.0.0
**Status:** Stable / Draft / Deprecated
**Last Updated:** YYYY-MM-DD

## Overview

Brief description of what this format represents and when to use it.

## Structure

```json
{
  "field1": "type",
  "field2": "type"
}
```

## Fields

### field1 (required)

- **Type:** string
- **Description:** What this field represents
- **Constraints:** 1-100 characters, alphanumeric only
- **Example:** `"abc123"`

### field2 (required)

- **Type:** number
- **Description:** What this field represents
- **Constraints:** Integer, 0-1000000
- **Example:** `42`

## Examples

### Basic Example

```json
{
  "field1": "hello",
  "field2": 123
}
```

### Complete Example

```json
{
  "field1": "world",
  "field2": 456
}
```

## Validation Rules

1. All required fields must be present
2. field1 must match pattern `^[a-z0-9]{1,100}$`
3. field2 must be in range [0, 1000000]

## Error Handling

| Condition | Error |
|-----------|-------|
| Missing field1 | `MISSING_FIELD1` |
| Invalid field1 format | `INVALID_FIELD1_FORMAT` |
| field2 out of range | `FIELD2_OUT_OF_RANGE` |

## Version History

- **1.0.0** (YYYY-MM-DD): Initial release
```

---

## Quick Checklist

Before finalizing any format:

- [ ] Can a junior dev implement it in one day?
- [ ] Is there only ONE way to represent each concept?
- [ ] Are all fields properly typed (not stringly-typed)?
- [ ] Are constraints explicit (length, range, pattern)?
- [ ] Is optionality minimized?
- [ ] Are examples provided?
- [ ] Have you implemented both reader AND writer?
- [ ] Does round-trip work (write → read → write = same)?

---

## Format vs Implementation

Remember: Format design is SEPARATE from implementation.

```
Format Design → Specification → Multiple Implementations
                                ├── TypeScript
                                ├── Go
                                ├── Python
                                └── Rust
```

A well-designed format enables quality implementations in ANY language.
