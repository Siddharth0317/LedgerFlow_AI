# ⚡ Agentflow_AI (LedgerFlow)
### Autonomous Multi-Agent Invoice & Expense Operations Hub

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16%20(Turbopack)-black.svg)](https://nextjs.org/)
[![React Flow](https://img.shields.io/badge/React%20Flow-12-purple.svg)](https://reactflow.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time%20WebSockets-orange.svg)](https://socket.io/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-blue.svg)](https://ai.google.dev/)
[![AES-256](https://img.shields.io/badge/Security-AES--256--CBC-red.svg)](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)

---

## 📖 Overview

**Agentflow_AI** is an enterprise-grade, autonomous multi-agent financial automation platform designed to eliminate manual data entry, human computation errors, and reconciliation delays in accounts payable (AP) workflows.

The system uses a sequential **5-agent pipeline** powered by Google Gemini and OpenRouter LLMs to intake incoming invoice PDFs, extract structured financial records, verify mathematical arithmetic formulas with strict assertion proofs ($|\text{subtotal} + \text{tax} - \text{totalAmount}| < 0.01$), and automatically commit verified ledger entries to Google Sheets while broadcasting audit alerts to Slack and Discord.

---

## 🚀 Key Features

### 1. 🎨 Visual Drag-and-Drop Workflow Canvas
- Built with **React Flow 12** featuring smooth step edges and custom animated connection handles.
- **4 Specialized Node Types**:
  - 📥 **Trigger Node**: Polls Gmail inboxes or receives direct webhook invoice payloads.
  - 🧠 **AI Parser Node**: Executes multimodal OCR and schema extraction via Google Gemini.
  - ⚖️ **Logic Node**: Enforces financial formula assertion rules (`subtotal + tax == totalAmount`).
  - 📤 **Action Node**: Appends rows to Google Sheets and dispatches Slack / Discord notifications.
- Interactive **Node Inspector Drawer**, canvas pan/zoom controls, DAG validation, and workflow duplication.

### 2. ✨ AI Prompt-to-Workflow Generator (`/workflows/builder`)
- Generate fully wired, multi-node DAG workflows from plain English text prompts (e.g. *"Extract invoices from Gmail, verify subtotal + tax equals total, and notify Slack"*).
- Powered by **Google Gemini 2.5 Flash** with deterministic rule-based fallback and confidence score evaluation (`99%`).

### 3. 🤖 5-Agent Autonomous Orchestration Engine
- **1. Planner Agent**: Validates DAG topology, eliminates circular graph cycles, and computes optimal execution order via topological sort.
- **2. Execution Agent**: Parses invoices into structured JSON schema (`vendorName`, `subtotal`, `tax`, `totalAmount`, `lineItems`).
- **3. Validation Agent**: Enforces strict mathematical assertions ($|(\text{subtotal} + \text{tax}) - \text{totalAmount}| < 0.01$). If arithmetic fails, the pipeline halts to prevent fraudulent or corrupted entries.
- **4. Recovery Agent**: Classifies runtime errors (`FINANCIAL_MISMATCH`, `AUTH_EXPIRED`, `RATE_LIMIT`) and initiates exponential backoff retries.
- **5. Monitoring Agent**: Records immutable audit logs in MongoDB and streams live telemetry.

### 4. ⚡ Real-Time WebSockets & Background Queue Workers
- **Socket.IO Real-Time Streaming**: Live execution timelines on `/executions/[id]` receive instant log events (`execution:log`) and step transitions (`execution:step`) with sub-millisecond latency.
- **Background Execution Queue**: Event-driven queue processor with concurrency controls and deterministic in-memory worker fallback.
- **Execution State Controls**: Interactive **Pause**, **Resume**, and **Cancel** operations on active runs.

### 5. 🔒 Third-Party Integrations & AES-256 Cryptography
- **Google Workspace OAuth**: Gmail API and Google Sheets API integration with encrypted token storage.
- **Slack & Discord Webhook Bots**: Real-time channel alert dispatchers with interactive "Send Test Alert" verification.
- **AES-256-CBC Cryptography**: All OAuth tokens, refresh keys, and webhook URLs are encrypted at rest with dynamic 16-byte initialization vectors (`IV`).
- **In-App Notification Center**: Live notification feed with unread count badges and one-click "Mark All Read".

---

## 🏛️ Multi-Agent Architecture

```mermaid
flowchart TD
    subgraph Intake["1. Ingestion Layer"]
        A[Incoming Email / PDF / Webhook] --> B[Workflow Trigger Node]
    end

    subgraph Pipeline["2. 5-Agent Autonomous Orchestration Engine"]
        B --> C["1. Planner Agent\n(Topological Sort & Cycle Detection)"]
        C --> D["2. Execution Agent\n(Gemini Multimodal OCR Extraction)"]
        D --> E["3. Validation Agent\n(Math Proof: Subtotal + Tax == Total)"]
        
        E -- Math Discrepancy --> F["4. Recovery Agent\n(Error Classification & Operator Escalation)"]
        E -- Assertion Passed --> G["5. Monitoring Agent\n(Audit Logging & Socket.IO Broadcasting)"]
    end

    subgraph Output["3. Commitment & Dispatch Layer"]
        G --> H["Google Sheets Financial Ledger"]
        G --> I["Slack / Discord Webhook Alerts"]
        G --> J["Live Inspector WebSockets UI"]
    end
```

---

## 💻 Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 (Turbopack, Pages Router) | High-performance server-rendered and static React UI |
| **Workflow Canvas** | `@xyflow/react` (React Flow 12) | Interactive node-based DAG workflow builder |
| **Styling & Icons** | Tailwind CSS + Lucide React | Glassmorphic dark theme (`#07090E`, `#0F1424`) |
| **State Management** | Zustand | Client-side reactive stores for canvas and auth state |
| **Backend Runtime** | Node.js (ES Modules) + Express | RESTful API server and multi-agent engine |
| **Real-Time WebSockets**| Socket.IO | Room-based execution event and log streaming |
| **Database** | MongoDB Atlas + Mongoose 8 | Document store with compound indices and timestamps |
| **AI / LLM Providers** | Google Gemini 2.5 Flash + OpenRouter | Multimodal extraction and prompt-to-graph synthesis |
| **Security & Cryptography**| AES-256-CBC, Bcrypt (Cost 12), Helmet | Token encryption at rest and request hardening |

---

## 📁 Repository Structure

```
LedgerFlow_AI/
├── client/                          # Next.js Frontend Application
│   ├── src/
│   │   ├── components/              # AppShell, ProtectedRoute, Canvas Nodes
│   │   │   ├── AppShell/            # Sidebar, Header, NotificationDrawer
│   │   │   └── nodes/               # TriggerNode, AiNode, LogicNode, ActionNode
│   │   ├── pages/                   # Next.js Pages Router
│   │   │   ├── index.js             # Landing Page
│   │   │   ├── dashboard.js         # Operations Console & Metrics
│   │   │   ├── login.js & register.js # Authentication
│   │   │   ├── workflows/           # Workflows List, Canvas, & AI Studio
│   │   │   ├── executions/          # History Table & Live Inspector
│   │   │   └── integrations.js      # OAuth & Webhook Integrations Hub
│   │   ├── services/                # Axios API client & Socket.IO client
│   │   └── store/                   # Zustand Workflow & Auth Stores
│   ├── vercel.json                  # Vercel Deployment Configuration
│   └── package.json
│
├── server/                          # Node.js Express Backend
│   ├── src/
│   │   ├── agents/                  # 5-Agent Pipeline Modules
│   │   │   ├── plannerAgent.js      # Topological DAG validation
│   │   │   ├── executionAgent.js    # Gemini document parsing
│   │   │   ├── validationAgent.js   # Arithmetic formula verification
│   │   │   ├── recoveryAgent.js     # Error handling & backoff
│   │   │   ├── monitoringAgent.js   # Audit logs & WebSocket emitter
│   │   │   └── orchestrator.js      # Sequential pipeline coordinator
│   │   ├── config/                  # DB, Environment, Socket.IO, & Queue
│   │   ├── controllers/             # Workflow, Execution, Auth, & Integration
│   │   ├── middleware/              # JWT Protect & Centralized Error Handler
│   │   ├── models/                  # User, Workflow, Execution, Log, Integration
│   │   ├── routes/                  # Express REST Route Handlers
│   │   ├── services/                # AI Service & Integration Service
│   │   └── utils/                   # AES-256-CBC Cryptographic Utilities
│   ├── scripts/
│   │   └── clean-mock-data.js       # Database sanitization utility
│   ├── tests/                       # Automated End-to-End Test Suites
│   └── package.json
│
├── render.yaml                      # Render Production Backend Blueprint
├── spec.md                          # Full Architecture & Requirements Spec
└── README.md
```

---

## 🛠️ Quick Start & Local Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI or local MongoDB daemon
- [Google AI Studio API Key](https://aistudio.google.com/) (Optional: for live Gemini extraction)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Siddharth0317/LedgerFlow_AI.git
cd LedgerFlow_AI
```

---

### Step 2: Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/agentflow_ai
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# AES-256 Key for Token Encryption at Rest
CREDENTIAL_ENCRYPTION_KEY=agentflow_sec_994b7e8832a104c8f2b74051a8d0e729_2026

# AI LLM API Keys
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Google Workspace OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/integrations
```

Start the backend server:
```bash
npm run dev
# Server running on http://localhost:5000 (WebSockets active)
```

---

### Step 3: Frontend Setup
Open a new terminal window:
```bash
cd client
npm install
```

Create a `.env.local` file in `client/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the Next.js development server:
```bash
npm run dev
# Client running on http://localhost:3000
```

---

## 🧪 Automated End-to-End Test Suites

The project includes an automated test runner validating all system layers across **40 assertions (100% Pass Rate)**:

```bash
# 1. Test Core Engine, Auth, Canvas CRUD, & Multi-Agent Execution (Phases 1-4)
node server/tests/e2e_phases1_4.test.js

# 2. Test AES-256 Token Encryption, OAuth, & Bot Webhooks (Phase 5)
node server/tests/e2e_phase5.test.js

# 3. Test Background Queue Workers, Socket.IO WebSockets, & Health (Phase 6)
node server/tests/e2e_phase6.test.js

# 4. Verify Next.js Frontend Production Build
cd client && npm run build
```

---

## 🌐 Production Deployment

### Backend (Render)
1. Link your GitHub repository to [Render](https://render.com).
2. Create a new service from the [`render.yaml`](./render.yaml) blueprint.
3. Configure environment variables in the Render dashboard:
   `MONGODB_URI`, `JWT_SECRET`, `CREDENTIAL_ENCRYPTION_KEY`, `GEMINI_API_KEY`, `CLIENT_URL`.

### Frontend (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Add Environment Variable: `NEXT_PUBLIC_API_URL = https://your-backend.onrender.com/api`.
4. Deploy!

---

## 🔐 Security & Data Isolation
- **Zero Secret Leakage**: Strict `.gitignore` policy excluding all `.env` files, build caches, and test artifacts.
- **AES-256-CBC Encryption**: All credentials and tokens stored in MongoDB are encrypted at rest with dynamic IVs.
- **Bcrypt (Cost 12)**: Passwords are automatically hashed prior to database persistence.
- **User Scoped Queries**: Every database query is strictly scoped to the authenticated `{ owner: req.user._id }`.
- **Helmet & CORS**: Enhanced HTTP response headers and origin whitelisting enabled.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
