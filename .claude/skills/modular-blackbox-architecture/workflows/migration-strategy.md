# Migration Strategy Workflow

**Purpose:** Plan and execute gradual system migrations using glue code and parallel operation

**When to Use:**
- Replacing a system component
- Upgrading to new version with breaking changes
- Migrating from one technology to another
- Any "big change" that feels risky

---

## Core Principle

> "A lot of small chances of failures equals a big chance of failure."

**Never do big-bang migrations.** The risk compounds with scope.

---

## The Glue Code Pattern

### Architecture

```
┌─────────────────────────────────────────────┐
│              Your Application               │
└───────────────────┬─────────────────────────┘
                    │ calls
                    ▼
┌─────────────────────────────────────────────┐
│              Glue Layer                     │
│  (Routes traffic between old and new)       │
└───────┬───────────────────────┬─────────────┘
        │                       │
        ▼                       ▼
┌───────────────┐     ┌───────────────────────┐
│  Old System   │     │     New System        │
│  (Retiring)   │     │  (Being validated)    │
└───────────────┘     └───────────────────────┘
```

### Benefits

1. **Parallel Operation:** Both systems run simultaneously
2. **Gradual Traffic Shift:** Move users incrementally
3. **Easy Rollback:** Switch back instantly if issues
4. **Validation:** Compare outputs before committing
5. **Zero Downtime:** No "maintenance windows"

---

## Migration Phases

### Phase 1: Preparation

**Goal:** Create glue layer without changing behavior

**Steps:**
1. Identify all integration points
2. Create glue layer that routes 100% to old system
3. Deploy and verify no change in behavior
4. Add monitoring/logging to glue layer

**Checklist:**
- [ ] All integration points identified
- [ ] Glue layer implemented
- [ ] Glue layer routes 100% to old system
- [ ] Monitoring in place
- [ ] Behavior verified unchanged

### Phase 2: Shadow Mode

**Goal:** Validate new system without affecting users

**Steps:**
1. Deploy new system alongside old
2. Glue layer sends requests to BOTH systems
3. Old system serves users (source of truth)
4. New system results are compared but not used
5. Fix discrepancies until outputs match

**Traffic Pattern:**
```
Request → Glue → Old System → Response (used)
              ↘ New System → Response (logged, compared, discarded)
```

**Checklist:**
- [ ] New system deployed
- [ ] Dual-write enabled
- [ ] Comparison logging in place
- [ ] Discrepancies identified and fixed
- [ ] Outputs match for >99% of requests

### Phase 3: Canary Deployment

**Goal:** Validate new system with small portion of real traffic

**Steps:**
1. Route small percentage (1-5%) to new system
2. Monitor closely for errors, latency, correctness
3. Gradually increase if healthy
4. Rollback instantly if issues

**Traffic Pattern:**
```
Request → Glue → 95% Old System
              ↘ 5% New System
```

**Percentage Ramp:**
- Day 1: 1%
- Day 2-3: 5%
- Day 4-7: 10%
- Week 2: 25%
- Week 3: 50%
- Week 4: 90%
- Final: 100%

**Checklist:**
- [ ] Feature flags for traffic splitting
- [ ] Monitoring dashboards ready
- [ ] Rollback procedure documented
- [ ] Each percentage increase approved

### Phase 4: Full Migration

**Goal:** Complete transition to new system

**Steps:**
1. Route 100% traffic to new system
2. Keep old system running but idle
3. Monitor for delayed issues
4. After grace period, decommission old system

**Checklist:**
- [ ] 100% traffic on new system
- [ ] Old system idle but available
- [ ] 2-week grace period observed
- [ ] No rollbacks needed
- [ ] Old system decommissioned

### Phase 5: Cleanup

**Goal:** Remove migration infrastructure

**Steps:**
1. Remove glue layer routing logic
2. Direct integration with new system
3. Remove old system entirely
4. Archive migration documentation

**Checklist:**
- [ ] Glue layer simplified/removed
- [ ] Direct integration working
- [ ] Old system decommissioned
- [ ] Documentation archived

---

## Glue Layer Implementation

### TypeScript Example

```typescript
interface Service {
  process(input: Input): Promise<Output>
}

class MigrationGlue implements Service {
  constructor(
    private oldService: Service,
    private newService: Service,
    private config: MigrationConfig
  ) {}

  async process(input: Input): Promise<Output> {
    const useNew = this.shouldUseNewSystem(input)

    if (this.config.shadowMode) {
      // Phase 2: Shadow mode
      const oldResult = await this.oldService.process(input)

      // Fire-and-forget to new system for comparison
      this.newService.process(input)
        .then(newResult => this.compare(input, oldResult, newResult))
        .catch(err => this.logError('shadow', err))

      return oldResult
    }

    if (useNew) {
      try {
        return await this.newService.process(input)
      } catch (error) {
        if (this.config.fallbackEnabled) {
          this.logError('fallback-triggered', error)
          return await this.oldService.process(input)
        }
        throw error
      }
    }

    return await this.oldService.process(input)
  }

  private shouldUseNewSystem(input: Input): boolean {
    // Feature flag + percentage rollout
    if (!this.config.newSystemEnabled) return false

    // Hash input for consistent routing
    const hash = this.hash(input.userId || input.requestId)
    return hash < this.config.newSystemPercentage
  }

  private compare(input: Input, oldResult: Output, newResult: Output): void {
    if (!this.deepEqual(oldResult, newResult)) {
      this.logger.warn('Migration comparison mismatch', {
        input,
        oldResult,
        newResult
      })
    }
  }
}

interface MigrationConfig {
  shadowMode: boolean
  newSystemEnabled: boolean
  newSystemPercentage: number // 0-100
  fallbackEnabled: boolean
}
```

### Configuration Ramp

```typescript
// Phase 2: Shadow Mode
const shadowConfig: MigrationConfig = {
  shadowMode: true,
  newSystemEnabled: true,
  newSystemPercentage: 100, // Send to both
  fallbackEnabled: false
}

// Phase 3: Canary 5%
const canary5Config: MigrationConfig = {
  shadowMode: false,
  newSystemEnabled: true,
  newSystemPercentage: 5,
  fallbackEnabled: true
}

// Phase 3: Canary 50%
const canary50Config: MigrationConfig = {
  shadowMode: false,
  newSystemEnabled: true,
  newSystemPercentage: 50,
  fallbackEnabled: true
}

// Phase 4: Full Migration
const fullMigrationConfig: MigrationConfig = {
  shadowMode: false,
  newSystemEnabled: true,
  newSystemPercentage: 100,
  fallbackEnabled: false // Confident enough to fail without fallback
}
```

---

## Database Migration Pattern

### Dual-Write Strategy

For database migrations:

```typescript
class DualWriteRepository {
  async save(entity: Entity): Promise<void> {
    // Write to both databases
    await Promise.all([
      this.oldDb.save(entity),
      this.newDb.save(entity)
    ])
  }

  async get(id: string): Promise<Entity> {
    // Read from primary (old until migration complete)
    if (this.config.readFromNew) {
      return await this.newDb.get(id)
    }
    return await this.oldDb.get(id)
  }
}
```

### Data Backfill

```typescript
async function backfillData(): Promise<void> {
  const batchSize = 1000
  let cursor = null

  while (true) {
    const batch = await oldDb.getBatch(cursor, batchSize)
    if (batch.length === 0) break

    await newDb.bulkInsert(batch)
    cursor = batch[batch.length - 1].id

    // Progress logging
    console.log(`Migrated up to ID: ${cursor}`)
  }
}
```

---

## Rollback Procedures

### Instant Rollback

```typescript
// In case of emergency
async function rollback(): Promise<void> {
  migrationConfig.newSystemPercentage = 0
  migrationConfig.newSystemEnabled = false

  await configStore.save(migrationConfig)
  await notifyTeam('Migration rolled back')
}
```

### Criteria for Rollback

Trigger rollback if:
- Error rate > 1% (or baseline + 0.5%)
- P95 latency > 2x baseline
- Data inconsistencies detected
- User-reported issues increase

---

## Migration Checklist Template

```markdown
# Migration: [Old System] → [New System]

## Overview
- **Start Date:** YYYY-MM-DD
- **Target Completion:** YYYY-MM-DD
- **Owner:** [Name]
- **Stakeholders:** [Names]

## Pre-Migration
- [ ] New system implemented and tested
- [ ] Glue layer implemented
- [ ] Monitoring dashboards ready
- [ ] Rollback procedure documented
- [ ] Team briefed

## Phase 1: Preparation
- [ ] Glue layer deployed (100% old)
- [ ] Behavior verified unchanged
- [ ] Baseline metrics captured

## Phase 2: Shadow Mode
- [ ] Dual-write enabled
- [ ] Comparison logging active
- [ ] Discrepancies < 0.1%

## Phase 3: Canary
- [ ] 1% traffic migrated
- [ ] 5% traffic migrated
- [ ] 10% traffic migrated
- [ ] 25% traffic migrated
- [ ] 50% traffic migrated
- [ ] 90% traffic migrated

## Phase 4: Full Migration
- [ ] 100% traffic on new system
- [ ] 2-week observation period
- [ ] No rollbacks triggered

## Phase 5: Cleanup
- [ ] Old system decommissioned
- [ ] Glue layer removed
- [ ] Documentation archived
- [ ] Retrospective completed

## Rollback Log
| Date | Percentage | Reason | Duration |
|------|------------|--------|----------|
| | | | |

## Issues Log
| Date | Issue | Resolution | Owner |
|------|-------|------------|-------|
| | | | |
```

---

## Quick Reference

| Phase | Traffic Split | Rollback Time | Risk Level |
|-------|---------------|---------------|------------|
| Preparation | 100% Old | Instant | None |
| Shadow Mode | 100% Old (dual-write) | Instant | Very Low |
| Canary 5% | 95/5 | Instant | Low |
| Canary 50% | 50/50 | Instant | Medium |
| Full Migration | 100% New | Minutes | Medium-High |
| Post-Cleanup | 100% New (no fallback) | Manual | High |

---

## Key Principles

1. **Never big-bang:** Gradual is always safer
2. **Always have rollback:** Instant revert capability
3. **Compare before serving:** Shadow mode validates behavior
4. **Monitor everything:** Errors, latency, correctness
5. **Document the process:** Future you will thank present you
