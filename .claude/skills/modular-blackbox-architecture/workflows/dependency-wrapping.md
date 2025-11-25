# Dependency Wrapping Workflow

**Purpose:** Implement wrapper layers for external dependencies to maintain architectural control

**When to Use:**
- Adding new external library
- Discovering direct external calls scattered in codebase
- Creating platform abstraction layers
- Preparing for dependency migration

---

## Core Principle

> "Even if you're using something really good, you really want to wrap it so you don't actually have a bunch of calls directly to code you don't have."

**The Rule:** NEVER call external code directly from business logic.

---

## Why Wrap Everything External

### 1. Control

You don't control external library evolution. They can:
- Change APIs between versions
- Deprecate features you depend on
- Make breaking changes
- Go unmaintained

### 2. Testability

Wrappers enable:
- Easy mocking in tests
- Swapping real for fake implementations
- Testing without external services

### 3. Migration Path

When you need to switch dependencies:
- Change wrapper implementation
- No business logic changes required
- Gradual migration possible

### 4. Abstraction

Your wrapper can:
- Simplify complex APIs
- Add missing features
- Enforce your conventions

---

## The Wrapping Pattern

### Architecture

```
┌─────────────────────────────────────────────┐
│              Your Business Logic            │
└───────────────────┬─────────────────────────┘
                    │ calls
                    ▼
┌─────────────────────────────────────────────┐
│           Your Wrapper Layer                │
│  (You own this, define your own interface)  │
└───────────────────┬─────────────────────────┘
                    │ uses
                    ▼
┌─────────────────────────────────────────────┐
│          External Library/Service           │
│      (You don't control this code)          │
└─────────────────────────────────────────────┘
```

### Never Do This

```
┌─────────────────────────────────────────────┐
│              Your Business Logic            │
└───────────────────┬─────────────────────────┘
                    │ DIRECT CALL (BAD!)
                    ▼
┌─────────────────────────────────────────────┐
│          External Library/Service           │
└─────────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Define Your Interface

Design the interface YOU want, not what the library provides.

```typescript
// Your interface - designed for YOUR needs
interface HttpClient {
  get<T>(url: string, options?: RequestOptions): Promise<T>
  post<T>(url: string, body: unknown, options?: RequestOptions): Promise<T>
  // ... only what YOU need
}

interface RequestOptions {
  headers?: Record<string, string>
  timeout?: number
  retry?: RetryConfig
}
```

### Step 2: Create the Wrapper

Implement YOUR interface using the external library.

```typescript
// Wrapper implementation
import axios from 'axios'  // External dependency

class AxiosHttpClient implements HttpClient {
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    const response = await axios.get(url, {
      headers: options?.headers,
      timeout: options?.timeout,
    })
    return response.data
  }

  async post<T>(url: string, body: unknown, options?: RequestOptions): Promise<T> {
    const response = await axios.post(url, body, {
      headers: options?.headers,
      timeout: options?.timeout,
    })
    return response.data
  }
}
```

### Step 3: Provide Factory

Never let business logic instantiate directly.

```typescript
// Factory function
function createHttpClient(): HttpClient {
  return new AxiosHttpClient()
}

// Business logic uses interface, not implementation
export { HttpClient, createHttpClient }
```

### Step 4: Use Only Your Interface

```typescript
// ❌ BAD: Direct import of external library
import axios from 'axios'
const data = await axios.get('/api/users')

// ✅ GOOD: Use your wrapper
import { createHttpClient } from './http-client'
const client = createHttpClient()
const data = await client.get('/api/users')
```

---

## Common Wrapper Categories

### 1. HTTP Clients

```typescript
interface HttpClient {
  get<T>(url: string): Promise<T>
  post<T>(url: string, body: unknown): Promise<T>
  put<T>(url: string, body: unknown): Promise<T>
  delete(url: string): Promise<void>
}
// Wraps: axios, fetch, got, node-fetch
```

### 2. Database Clients

```typescript
interface Database {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>
  execute(sql: string, params?: unknown[]): Promise<void>
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>
}
// Wraps: pg, mysql2, better-sqlite3, Prisma
```

### 3. File System

```typescript
interface FileSystem {
  read(path: string): Promise<string>
  write(path: string, content: string): Promise<void>
  exists(path: string): Promise<boolean>
  delete(path: string): Promise<void>
}
// Wraps: fs/promises, fs-extra
```

### 4. Logging

```typescript
interface Logger {
  debug(message: string, context?: object): void
  info(message: string, context?: object): void
  warn(message: string, context?: object): void
  error(message: string, error?: Error, context?: object): void
}
// Wraps: winston, pino, bunyan, console
```

### 5. Configuration

```typescript
interface Config {
  get<T>(key: string, defaultValue?: T): T
  has(key: string): boolean
}
// Wraps: dotenv, config, env-var
```

### 6. External APIs

```typescript
interface PaymentGateway {
  charge(amount: number, currency: string, token: string): Promise<PaymentResult>
  refund(chargeId: string, amount?: number): Promise<RefundResult>
}
// Wraps: Stripe, PayPal, Braintree
```

---

## Platform Layer Pattern

For OS/platform dependencies, create a platform layer:

```typescript
// platform.ts - Interface for platform operations
interface Platform {
  // File operations
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>

  // Environment
  getEnv(key: string): string | undefined

  // Network
  fetch(url: string, options?: FetchOptions): Promise<Response>

  // Time
  now(): Date
  sleep(ms: number): Promise<void>
}

// Implementations for different platforms
class NodePlatform implements Platform { ... }
class BrowserPlatform implements Platform { ... }
class TestPlatform implements Platform { ... }  // For testing!
```

---

## Testing With Wrappers

### Mock Implementation

```typescript
// Mock HTTP client for testing
class MockHttpClient implements HttpClient {
  private responses: Map<string, unknown> = new Map()

  setResponse(url: string, data: unknown): void {
    this.responses.set(url, data)
  }

  async get<T>(url: string): Promise<T> {
    const response = this.responses.get(url)
    if (!response) throw new Error(`No mock for ${url}`)
    return response as T
  }
}

// In tests
const mockClient = new MockHttpClient()
mockClient.setResponse('/api/users', [{ id: 1, name: 'Test' }])
const service = new UserService(mockClient)
```

### Test Platform

```typescript
// TestPlatform for deterministic testing
class TestPlatform implements Platform {
  private currentTime = new Date('2024-01-01')

  now(): Date {
    return this.currentTime
  }

  setTime(date: Date): void {
    this.currentTime = date
  }

  async sleep(ms: number): Promise<void> {
    // Don't actually sleep in tests
    this.currentTime = new Date(this.currentTime.getTime() + ms)
  }
}
```

---

## Migration Example

### Before: Direct Axios Calls

```typescript
// Scattered throughout codebase
import axios from 'axios'

// File 1
const users = await axios.get('/api/users')

// File 2
const posts = await axios.get('/api/posts')

// File 3
await axios.post('/api/comments', comment)
```

### After: Wrapped with Migration Path

```typescript
// Step 1: Create wrapper
// http-client.ts
interface HttpClient { ... }
class AxiosHttpClient implements HttpClient { ... }
export const createHttpClient = () => new AxiosHttpClient()

// Step 2: Gradually replace direct calls
// File 1 (migrated)
const client = createHttpClient()
const users = await client.get('/api/users')

// File 2 (not yet migrated - still works)
const posts = await axios.get('/api/posts')

// Step 3: Eventually, swap implementation
class FetchHttpClient implements HttpClient {
  // Uses native fetch instead of axios
}
export const createHttpClient = () => new FetchHttpClient()
// Zero changes to business logic!
```

---

## Wrapper Checklist

Before adding any external dependency:

- [ ] Created interface defining YOUR needs (not library's full API)
- [ ] Implemented wrapper class
- [ ] Created factory function
- [ ] Added mock implementation for testing
- [ ] No direct imports of external library in business logic
- [ ] Documented wrapper usage

---

## Quick Reference

| Situation | Action |
|-----------|--------|
| Adding new library | Create wrapper first |
| Found direct calls | Refactor to use wrapper |
| Need to mock for tests | Use wrapper interface |
| Switching implementations | Update wrapper only |
| Library breaking change | Fix in wrapper, not business logic |
