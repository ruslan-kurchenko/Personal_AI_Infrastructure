---
name: khealth-context
description: |
  K Health company context including project inventory, development conventions, and healthcare compliance requirements.
  AUTO-LOADS when working in ~/Projects/k-health/ directories or when git remote is gitlab.com:khealth/*.
  USE WHEN user mentions K Health, KARE- tickets, workforce-manager, kai, care-manager, or other K Health projects.
---

# K Health - Work Context Skill

**Auto-loads when:** Working in K Health projects, mentioning K Health topics, or git remote detected

---

## Overview

K Health is a telehealth AI company building platforms for Healthcare Clinics to digitize workflows. This skill provides project inventory, conventions, and context for K Health development work.

**Domain:** Healthcare/Telehealth with HIPAA compliance requirements
**Team:** Kare Team (Clinic Operations & Workflow Digitization)
**Base Directory:** `~/Projects/k-health/`
**Project Tracking:** Linear (ticket prefix: KARE-)
**Git Remote Pattern:** `git@gitlab.com:khealth/{team}/{project}.git`

---

## Project Inventory

### Primary Projects (Frequently Used)

**Core Services:**
- **workforce-manager** - Workforce scheduling and management system
- **kai** - Voice service + scheduling service (Kotlin/Micronaut)
- **care-manager** - Patient care management and treatment workflows
- **accounts** - User account management service (NestJS/GraphQL)
- **messaging-service** - Internal messaging and notifications
- **medical-chat-service** - Clinical chat and communication

**Salesforce Integration:**
- **salesforce-service** - Monorepo bridging Salesforce with K Health services
- **salesforce-source** - Salesforce metadata and source code
- **heroforce** - Salesforce-related automation
- **middle-force** - Middleware for Salesforce integration

**Infrastructure & DevOps:**
- **remote-infra** - Infrastructure as Code (IaC) and cloud provisioning
- **google-cloud-provisioning** - GCP resource management
- **virtualservers** - Virtual server management
- **on-demand-env-process** - On-demand environment provisioning

**Retool Applications:**
- **retool-apps** - Internal tools and admin interfaces
- **retool-voice-app** - Voice application interface
- **retool-custom-components** - Custom Retool components

**Quality & Testing:**
- **k-automation-e2e** - End-to-end testing automation
- **clinical-quality-portal** - Clinical quality metrics and monitoring
- **kpic** - Clinical automation and quality assurance

**Shared Libraries:**
- **kare-commons-ts** - Shared TypeScript utilities and types
- **graphql-common** - Common GraphQL schemas and resolvers
- **k-common-express-middlewares** - Shared Express middleware

**Support Services:**
- **help-center** - Customer support and help documentation
- **flow-manager** - Workflow orchestration
- **chimera** - (Gradle/Kotlin service)
- **getstream-components-web** - Stream chat components

**Legacy/Reference Projects:**
- **k-agent** - Python POC for autonomous agents (MGB partner), being replaced by KAI scheduling. Contains valuable system prompts and implementation details for AI agent architecture

### Additional Projects (60+ Total)

The full project list includes:
accounts, accounts-ui, agent-k, announcements, care-manager, chimera, circuit, clinical-automation-portal, clinical-quality-portal, cosmo-resources-manager, dd-test-logs, flow-manager, getstream-components-web, google-cloud-provisioner, graphql-common, helm-gitlab-gitlab_runner, helmfile-shared, help-center, heroforce, jira-workflow, jira-workflow-automator, jwt-generator, k-agent, k-automation-e2e, k-common-express-middlewares, kaccount, kai, kai-danon, kangpy, kare-common-ts, khealth-app, kpic, lazygit, medical-chat-service, messaging-service, middle-force, node-platform-packages, notify-channels, on-demand-env-process, on-demand-sf-dockerfile, pgsql-database, remote-infra, remote-infra-data-seeding, remote-infra-data-seeding-sf, retool-apps, retool-custom-components, retool-voice-app, salesforce-ci-cd-playground, salesforce-devops-dashboard, salesforce-devops-sandbox, salesforce-service, salesforce-source-dev, salesforce-source-parallel, sf-packaging, specs, twilio-serverless, universal-helm-chart, virtualservers, workforce-manager, workforce-manager-alpha

**Note:** Use `ls ~/Projects/k-health/` to see current project list during session.

---

## Tech Stack

### Languages & Frameworks

**Node.js/TypeScript (Primary):**
- NestJS - Microservices framework (accounts, care-manager, medical-chat-service)
- GraphQL/Apollo - API layer
- Express - HTTP middleware
- Prisma - Database ORM
- Jest - Testing framework

**Kotlin/Java:**
- Micronaut - Microservices framework (kai voice/scheduling service)
- Gradle - Build system (Kotlin DSL)

**Python:**
- Used for POCs and automation (k-agent autonomous agents POC)
- AI/ML tooling and experimentation

**Salesforce:**
- Apex - Salesforce platform language
- Salesforce Metadata API
- Integration with K Health services via salesforce-service

**Infrastructure:**
- Docker - Containerization
- Kubernetes/Helm - Orchestration
- Terraform/IaC - Cloud provisioning
- Google Cloud Platform - Primary cloud provider

**Databases:**
- PostgreSQL - Primary database
- Redis - Caching
- MongoDB - Document storage (some services)

**Observability:**
- Datadog - Metrics and monitoring
- OpenTelemetry - Distributed tracing (migration in progress)
- Sentry - Error tracking
- Segment - Analytics

**Communication:**
- Twilio - Voice and SMS
- Stream - Chat functionality
- GraphQL subscriptions - Real-time updates

### Project Type Patterns

**Monorepo Structure:**
- `packages/` subdirectory pattern
- Examples: salesforce-service, kare-common-ts

**Microservice Structure:**
- NestJS with standard src/ organization
- GraphQL schema-first approach
- Docker containerization

**Salesforce Projects:**
- Metadata structure (force-app/)
- Node.js build tools
- Integration bridges

---

## Development Conventions

### Code Principles (Always Apply)

**Core Principles:**
1. **Clean Code** - Readable, maintainable, self-documenting
2. **OOP** (Object-Oriented Programming) - Encapsulation, inheritance, polymorphism
3. **OOD** (Object-Oriented Design) - SOLID principles, design patterns
4. **DDD** (Domain-Driven Design) - Ubiquitous language, bounded contexts
5. **Black Box Architecture** - Modular, replaceable components with clean interfaces
6. **Black Box Development** - Implementation hidden, interface-first thinking

### Naming Conventions

**Git Branches:**
- Format depends on ticket system
- **KARE-** prefix for Kare Team tickets (e.g., `KARE-1234-feature-description`)
- Use Linear ticket number when applicable

**Commit Messages:**
- Include ticket prefix if branch contains it (KARE-, PLAT-, etc.)
- Follow project-specific conventions in CLAUDE.md
- Never mention Claude or AI in commit messages
- Focus on what changed and why (not who made it)

**Code Style:**
- Follow project-specific linting (ESLint, Prettier, ktlint)
- TypeScript: strict mode, explicit types
- Kotlin: idiomatic Kotlin patterns

### Project Documentation

**CLAUDE.md Files:**
- Most projects have `.claude/CLAUDE.md` at root
- Contains project-specific guidelines, architecture notes, and conventions
- **ALWAYS read project CLAUDE.md when switching contexts**

**README.md Files:**
- Setup instructions
- Architecture overview
- Development workflow
- Deployment procedures

---

## Security & Compliance

### HIPAA Awareness

K Health handles Protected Health Information (PHI). Always consider:
- **Data sensitivity** - Patient data, medical records, PII
- **Access controls** - Authentication, authorization, audit logging
- **Encryption** - At rest and in transit
- **Compliance** - HIPAA regulations, data retention policies

### Repository Security

**Before ANY commit:**
1. Run `git remote -v` to verify correct repository
2. Check for sensitive data (credentials, keys, PHI, PII)
3. Verify no hardcoded secrets or configuration
4. Ensure compliance with HIPAA requirements
5. Follow project-specific security guidelines in CLAUDE.md

**Critical Reminder:** K Health repositories contain company proprietary code and healthcare-sensitive data. Apply strict security review before all commits.

---

## Domain Context

### Core Domain Concepts

**Healthcare Workflows:**
- **Clinics** - Healthcare facilities using K Health platform
- **Patients** - End users receiving care
- **Providers** - Healthcare professionals (doctors, nurses)
- **Workforce** - Scheduling and management of healthcare staff
- **Treatments** - Patient care plans and medical interventions
- **Quality** - Clinical quality metrics and compliance

**System Components:**
- **Care Management** - Patient treatment and care coordination
- **Workforce Management** - Staff scheduling and resource allocation
- **Voice Services** - Telephony and communication systems
- **Salesforce Integration** - CRM and workflow digitization
- **Clinical Automation** - Quality assurance and process automation

### Learning During Chat

**Important:** Project-specific details (architecture, business logic, workflows) should be discovered during conversation by:
1. **Reading project documentation** (README.md, CLAUDE.md, docs/)
2. **Exploring code structure** (using Read, Grep, Glob tools)
3. **Asking clarifying questions** (using AskUserQuestion tool)
4. **Referencing Linear tickets** (for context on specific features)

Don't assume - always verify project-specific context by reading current documentation.

---

## Workflow Integration

### Linear Project Tracking

- **System:** Linear (linear.app)
- **Kare Team Prefix:** KARE-
- **Other Prefixes:** May vary by project/team (PLAT-, etc.)
- **Ticket Reference:** Use ticket number in branch names and commit messages when available

### Git Workflow

**Standard Flow:**
1. Create feature branch from main/master
2. Name branch with ticket prefix: `KARE-1234-feature-description`
3. Commit with descriptive messages including ticket reference
4. Create PR/MR for review
5. Merge to main after approval

**GitLab:** All K Health projects hosted on GitLab
- Remote pattern: `git@gitlab.com:khealth/{team}/{project}.git`
- Teams: services-team, salesforce, clinical-automation, mobile-team, enterprise-team, etc.

### Development Environment

**VSCode Workspace:**
- Multi-root workspace configuration exists: `k-health.code-workspace`
- Includes ~18 core projects for parallel development

**Package Managers:**
- **bun** - Preferred for new Node.js/TypeScript projects
- **npm** - Legacy projects and compatibility
- **gradle** - Kotlin/Java projects

---

## Auto-Loading Triggers

This skill automatically loads when:

### 1. Directory Detection
- Working directory is within `~/Projects/k-health/` or subdirectories
- Example: `/Users/ruslan.kurchenko_1/Projects/k-health/care-manager/`

### 2. Keyword Detection
- Mentioning: "K Health", "KHealth", "khealth"
- Ticket references: "KARE-", "PLAT-"
- Project names: "workforce-manager", "kai", "care-manager", etc.
- Domain terms: "clinic", "patient treatment", "workforce scheduling", "care manager", "salesforce integration"

### 3. Git Remote Detection
- Git remote URL matches: `git@gitlab.com:khealth/*`
- Detected via `git remote -v` output

---

## Quick Reference

### Common Commands

```bash
# List all K Health projects
ls ~/Projects/k-health/

# Check current git remote (ALWAYS before commits)
git remote -v

# Read project-specific guidelines
cat .claude/CLAUDE.md

# Check Linear ticket (if provided)
# Reference ticket in commits: KARE-1234
```

### Project Navigation

```
~/Projects/k-health/
├── workforce-manager/       # Workforce scheduling
├── kai/                     # Voice + scheduling (Kotlin)
├── care-manager/            # Patient care workflows
├── salesforce-service/      # SF integration (monorepo)
├── remote-infra/            # Infrastructure code
├── retool-apps/             # Internal tools
├── k-automation-e2e/        # Testing
└── [60+ other projects]
```

### Key Contacts

**Team Contacts:** Not included for privacy (as specified)

**User:** Ruslan Kurchenko (Senior Full Stack Engineer & Technical Architect)

---

## Integration with PAI Skills

### Related Skills

**Auto-invoked when relevant:**
- **modular-blackbox-architecture** - When designing K Health system architectures
- **ffuf** - When performing security testing on K Health services

**Research & Planning:**
- Use Task(engineer) for complex K Health implementations
- Use Task(architect) for system design and PRDs
- Use research skill for investigating K Health technologies

---

## Notes

- **Privacy:** No team member names, PII, or PHI included (as requested)
- **Discovery-based:** Project-specific details learned during conversation
- **Security-first:** Always reference CORE security procedures for healthcare compliance
- **Modular:** This skill can be updated independently of CORE
- **Auto-loading:** No manual invocation needed when working on K Health projects

---

**Last Updated:** 2025-11-25
**Location:** `.claude/skills/khealth-context/SKILL.md`
**Skill Type:** Work context (auto-loaded via hook)
**Maintained by:** Ruslan Kurchenko

---

*This skill provides essential K Health context. For comprehensive system details, always read project-specific documentation during your work session.*
