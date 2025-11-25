# API Design Workflow

**Purpose:** Design future-proof APIs following blackbox principles

**When to Use:**
- Designing new module interfaces
- Evaluating existing API quality
- Planning API evolution
- Before exposing functionality

---

## Core API Design Philosophy

> "You never implement a good enough for now API. The API is the same."

**Translation:** Design the API you'll need in 5 years, even if you only implement basics today.

---

## The API Design Process

### Step 1: Define the Contract

**Questions to answer:**
- What is the conceptual model?
- What operations are possible?
- What will users need that you haven't built yet?

**Output:** Written interface definition (header file, TypeScript interface, etc.)

### Step 2: Design for Extension

**Pattern: Configuration Objects over Parameters**

```typescript
// ❌ BAD: Adding features requires signature changes
function createUser(name: string, email: string): User
function createUser(name: string, email: string, role: string): User // BREAKING!

// ✅ GOOD: Configuration objects extend without breaking
interface CreateUserOptions {
  name: string
  email: string
  role?: string      // Added later, no breaking change
  metadata?: Record<string, unknown>  // Future-proof
}
function createUser(options: CreateUserOptions): User
```

### Step 3: Hide Implementation Details

**Pattern: Opaque Types**

```typescript
// ❌ BAD: Exposing internals
interface User {
  _internalId: number  // Exposed internal detail
  data: Map<string, any>  // Implementation leaked
}

// ✅ GOOD: Opaque handle
interface User {
  id: string  // Public identifier only
  // Internal details hidden
}
function getUserData(user: User, key: string): unknown  // Access through API
```

### Step 4: Design for Unimplemented Features

**Think ahead:**
```typescript
// Even if you only support text today, design for multimedia
interface Message {
  type: 'text' | 'image' | 'video' | 'file'  // Extension ready
  content: string | MediaContent
  metadata?: MessageMetadata  // Future features
}

// Implement only what you need now:
// - type: 'text' ✅ implemented
// - type: 'image' ⏳ placeholder
// - type: 'video' ⏳ placeholder
// - type: 'file' ⏳ placeholder
```

---

## API Evaluation Checklist

### Stability Questions

- [ ] Can new features be added without signature changes?
- [ ] Can implementation change without breaking callers?
- [ ] Are internal details hidden?
- [ ] Is there a clear versioning strategy?

### Extension Questions

- [ ] Are there extension points for future capabilities?
- [ ] Is the API designed for TODAY or for 5 YEARS?
- [ ] Can third parties extend functionality?
- [ ] Are optional parameters used instead of overloads?

### Usability Questions

- [ ] Can a developer use this without reading implementation?
- [ ] Are error cases explicit?
- [ ] Is the happy path obvious?
- [ ] Does naming reveal intent?

### Testing Questions

- [ ] Can this be mocked/stubbed easily?
- [ ] Are there minimal dependencies to test?
- [ ] Can integration tests use the same interface?

---

## Common API Patterns

### 1. Builder Pattern

For complex object construction:

```typescript
const user = User.builder()
  .name("John")
  .email("john@example.com")
  .role("admin")        // Optional
  .metadata({ team: "eng" })  // Future extension
  .build()
```

### 2. Factory Pattern

For polymorphic creation:

```typescript
interface Renderer {
  render(content: Content): void
}

// Factory hides implementation choice
function createRenderer(type: string): Renderer {
  // Can change implementations without breaking callers
}
```

### 3. Strategy Pattern

For swappable behavior:

```typescript
interface SortStrategy {
  sort(items: Item[]): Item[]
}

// API accepts strategy, doesn't dictate implementation
function processItems(items: Item[], strategy: SortStrategy): Item[]
```

### 4. Event/Callback Pattern

For extensibility:

```typescript
interface EventEmitter {
  on(event: string, handler: Handler): void
  emit(event: string, data: unknown): void
}

// Callers extend behavior without modifying core
processor.on('itemProcessed', logToAnalytics)
processor.on('itemProcessed', updateUI)
```

---

## API Anti-Patterns

### 1. Leaky Abstractions

```typescript
// ❌ BAD: Internal error type exposed
function query(sql: string): PostgresResult  // Tied to Postgres!

// ✅ GOOD: Generic result
function query(params: QueryParams): QueryResult  // Implementation hidden
```

### 2. Chatty APIs

```typescript
// ❌ BAD: Multiple calls for one operation
getUserId()
getUserName(id)
getUserEmail(id)
getUserRole(id)

// ✅ GOOD: Single coherent operation
getUser(id)  // Returns complete user
```

### 3. God Functions

```typescript
// ❌ BAD: Does everything
processUserData(data, options)  // 50 possible operations

// ✅ GOOD: Single responsibility
createUser(data)
updateUser(id, changes)
validateUser(data)
```

### 4. Stringly-Typed APIs

```typescript
// ❌ BAD: String for everything
function handleAction(action: string, data: string): string

// ✅ GOOD: Type safety
function handleAction(action: Action, data: ActionData): ActionResult
```

---

## API Documentation Standard

Every API should document:

```typescript
/**
 * Brief description of what this does
 *
 * @param options - Configuration for the operation
 * @returns Description of return value
 * @throws When this error occurs
 *
 * @example
 * // Basic usage
 * const result = await operation({ required: 'value' })
 *
 * @example
 * // With all options
 * const result = await operation({
 *   required: 'value',
 *   optional: true,
 *   callback: () => console.log('done')
 * })
 *
 * @since 1.0.0
 */
```

---

## Version Evolution Strategy

### Semantic Versioning for APIs

- **MAJOR:** Breaking changes (avoid!)
- **MINOR:** New features (use extension points)
- **PATCH:** Bug fixes

### Deprecation Pattern

```typescript
/**
 * @deprecated Use newFunction() instead. Will be removed in v3.0.0
 */
function oldFunction(): void {
  console.warn('oldFunction is deprecated')
  return newFunction()  // Delegate to new implementation
}
```

### API Versioning

```typescript
// URL versioning for HTTP APIs
/api/v1/users
/api/v2/users

// Header versioning
Accept: application/vnd.api+json; version=2

// Module versioning
import { createUser } from 'user-api/v2'
```

---

## Quick Reference: API Design in 60 Seconds

1. **Write the interface FIRST** (before implementation)
2. **Use configuration objects** (not parameter lists)
3. **Hide internals** (opaque types, private fields)
4. **Design for 5 years** (extension points now)
5. **One way to do things** (no optional alternatives)
6. **Document with examples** (usage, not internals)
