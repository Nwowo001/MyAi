# AutoAgent System Architecture Documentation

## 1. Executive Overview

AutoAgent is designed as a multi-tenant AI Business Automation platform. The core goal is to enable businesses to delegate sales, customer support, lead qualification, booking management, and payment collection to an autonomous AI agent operating over messaging channels.

---

## 2. Key Architecture Principles

1. **Strict Channel Decoupling (`ChannelAdapter`)**: The conversation engine and AI orchestrator never interact with channel-specific SDKs (e.g. WhatsApp, Instagram, Telegram). All incoming channel webhooks are parsed into a standard `NormalizedInboundMessage`, and all outbound messages are issued as `NormalizedOutboundMessage`.
2. **AI Provider Abstraction (`AIProvider`)**: The AI Orchestrator depends strictly on the `AIProvider` interface. OpenAI is the default implementation, but Anthropic, Google Gemini, or local models can be added by implementing `AIProvider` without modifying business logic.
3. **Controlled Action Execution (Tool System)**: The AI agent cannot directly mutate database records or initiate transactions through free-form text. It must invoke registered, type-safe backend tools (`AIActionTool`). Actions (such as creating a booking or issuing a payment link) only succeed when the tool execution pipeline confirms success.
4. **Tenant Isolation**: Every database query, cache key, and business context is scoped by `businessId`. Business data separation is strictly enforced at both the API middleware layer and Prisma repository layer.
5. **Multi-Currency Support**: Prices and monetary transactions use ISO 4217 currency codes (default `NGN`). Symbols are never hardcoded.

---

## 3. High-Level Data Flow

```
Customer (WhatsApp)
       │
       ▼ (Webhook Request)
[ Express Webhook Route ]
       │
       ▼
[ ChannelAdapter (WhatsApp) ] ──► Normalizes to NormalizedInboundMessage
       │
       ▼
[ Message Dispatcher ] ──► Stores Message in DB & Checks Conversation Context
       │
       ▼
[ AI Orchestrator ] ──► Passes system prompt, tools, & history to AIProvider
       │
       ├──► AI requests tool call (e.g. `calculateQuote`, `generatePaymentLink`)
       │         │
       │         ▼
       │    [ Tool Registry ] ──► Executes business logic & updates DB
       │         │
       │         └─ Returns ToolResult to AI
       │
       ▼
[ AI Response Generation ]
       │
       ▼
[ ChannelAdapter ] ──► Converts NormalizedOutboundMessage to Meta WhatsApp API payload
       │
       ▼
Customer (WhatsApp)
```

---

## 4. Technology Stack & Decision Rationale

- **Monorepo**: TypeScript project using Turborepo for builds and cache sharing across web, api, and shared packages.
- **Frontend**: Next.js 14 App Router for fast server rendering, client-side dynamic dashboard features, and React 18 capabilities.
- **Backend API**: Node.js + Express.js with TypeScript for high throughput, predictable routing, and middleware flexibility.
- **ORM & Database**: Prisma ORM over PostgreSQL (Supabase) for type-safe relational modeling and migrations.
- **Auth**: Supabase Auth (JWT validation on API, SSR cookies on Frontend).
- **Structured Logging**: `pino` logger with redacts for sensitive credentials and structured JSON output for aggregation.
- **Encryption**: AES-256-GCM for securely storing integration access tokens in the database.

---

## 5. Security & Safety Architecture

- **Token Encryption**: Third-party OAuth tokens and secrets stored in the database are encrypted using AES-256-GCM authenticated encryption.
- **Human Escalation**: When customer sentiment drops, unknown requests occur, or explicit request for a human is made, the conversation status flips to `HANDOVER_PENDING` / `HUMAN_TAKEN_OVER`, immediately muting the AI.
- **Prompt Injection Defense**: Customer inputs are sanitized and treated strictly as untrusted text within system prompts.

---

## 6. Implementation Phases Roadmap

- **Phase 1**: Project Setup & Architecture Foundation (Current)
- **Phase 2**: Multi-Tenant Business & User Management
- **Phase 3**: Unified Database Schema (Prisma)
- **Phase 4**: Catalog Management (Products & Services)
- **Phase 5**: Customer & Lead Management
- **Phase 6**: Knowledge Base & RAG System
- **Phase 7**: Business Hours & Operations
- **Phase 8**: WhatsApp Channel Integration MVP
- **Phase 9**: AI Agent Orchestrator & Tool System
- **Phase 10**: Booking & Appointment System
- **Phase 11**: Order Engine & Paystack Payment Link Generator
- **Phase 12**: Real-time Human Handover Inbox
- **Phase 13**: Automation Rules & Triggers
- **Phase 14**: Analytics & Reporting
- **Phase 15**: Production Hardening & Deployment
