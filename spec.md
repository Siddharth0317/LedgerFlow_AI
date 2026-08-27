# spec.md: Agentflow_AI (Autonomous Invoice & Expense Operations Hub)

## 1. Project Overview & Target Persona
- **Product Name**: Agentflow_AI (Autonomous Invoice & Expense Operations Edition)
- **Target Persona**: Finance Operations Manager / Small Business Operator
- **Core Purpose**: An AI-powered operations platform that enables operators to describe workflow automations in natural language, visualize them as interactive graphs on a React Flow canvas, and execute them via an autonomous multi-agent chain.
- **Primary Business Flow**: 
  1. The platform monitors or ingests incoming financial communications (invoices, receipts) via **Gmail OAuth**.
  2. The **Planner Agent** parses task requirements and schedules execution nodes.
  3. The **Execution Agent** runs an extraction pipeline (using Google Gemini / OpenRouter) on email text or PDF attachments to extract vendor name, invoice date, line items, subtotal, tax, and total amount[cite: 1, 3].
  4. The **Validation Agent** enforces mathematical integrity (`subtotal + tax == totalAmount`) and confirms required fields.
  5. The **Execution Agent** appends valid records to a connected **Google Sheet** and notifies **Slack / Discord** channels[cite: 3].
  6. The **Recovery Agent** handles token expirations, API rate limits, or schema mismatches via exponential backoff or escalation[cite: 3].
  7. The **Monitoring Agent** emits real-time event updates to the client interface via **Socket.IO** and logs audit records to **MongoDB**[cite: 3].

---

## 2. Technology Stack & Deployment Architecture
- **Frontend Framework**: Next.js 14+ (Pages Router), React 19, Tailwind CSS[cite: 3]
- **State Management & UI Toolkit**: Zustand, Lucide React Icons, React Flow (`@xyflow/react`), Axios, Socket.IO Client[cite: 3]
- **Backend Runtime & Framework**: Node.js (LTS), Express.js[cite: 2, 3]
- **Real-Time & Queue Layer**: Socket.IO, BullMQ on Redis (with in-memory fallback for local development)[cite: 3]
- **AI & Orchestration**: Google Generative AI SDK (Gemini), OpenRouter API, LangChain / LangGraph[cite: 3]
- **Database & ODM**: MongoDB Atlas / Supabase, Mongoose[cite: 2, 3]
- **Security & Utilities**: JSON Web Tokens (JWT), bcryptjs (cost factor 12), Helmet, Morgan, Compression, express-validator, crypto (AES-256 for token encryption)[cite: 3]
- **Deployment Targets**:
  - **Frontend**: Vercel (`NEXT_PUBLIC_API_URL`)[cite: 2]
  - **Backend**: Render (`PORT`, `MONGODB_URI`, `CLIENT_URL`)[cite: 2]
  - **Database**: MongoDB Atlas Cluster[cite: 2]
  - **Source Control**: GitHub (with strict `.gitignore`)[cite: 2]

---

## 3. Database Collections & Schemas (Mongoose)

### 3.1 Users Collection (`User.js`)
- `name`: String, required, trim[cite: 3]
- `email`: String, required, unique, lowercase, trim[cite: 3]
- `password`: String, required, select: false (hashed with bcrypt cost factor 12)[cite: 3]
- `role`: String, enum: `['admin', 'operator']`, default: `'operator'`[cite: 3]
- `lastLogin`: Date[cite: 3]
- `createdAt`, `updatedAt`: Timestamps

### 3.2 Workflows Collection (`Workflow.js`)
- `name`: String, required, trim[cite: 3]
- `description`: String[cite: 3]
- `owner`: ObjectId (ref: 'User'), required[cite: 3]
- `status`: String, enum: `['draft', 'active', 'paused', 'archived']`, default: `'draft'`[cite: 3]
- `triggerConfig`: Object (`{ type: 'gmail' | 'manual' | 'webhook', config: Object }`)[cite: 3]
- `nodes`: Array of React Flow node objects (`[{ id, type, position, data }]`)[cite: 3]
- `edges`: Array of React Flow edge objects (`[{ id, source, target, animated }]`)[cite: 3]
- `version`: Number, default: 1[cite: 3]
- `tags`: [String][cite: 3]
- `createdAt`, `updatedAt`: Timestamps

### 3.3 Executions Collection (`Execution.js`)
- `workflowId`: ObjectId (ref: 'Workflow'), required[cite: 3]
- `owner`: ObjectId (ref: 'User'), required[cite: 3]
- `snapshot`: Object, required (immutable copy of the workflow at execution time)[cite: 3]
- `status`: String, enum: `['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED']`, default: `'PENDING'`[cite: 3]
- `currentNode`: String[cite: 3]
- `startTime`: Date, default: Date.now[cite: 3]
- `endTime`: Date[cite: 3]
- `duration`: Number (in milliseconds)[cite: 3]
- `inputs`: Object[cite: 3]
- `outputs`: Object[cite: 3]
- `error`: Object (`{ code: String, message: String, stack: String }`)[cite: 3]
- `retryCount`: Number, default: 0[cite: 3]
- `createdAt`, `updatedAt`: Timestamps

### 3.4 ExecutionLogs Collection (`ExecutionLog.js`)
- `executionId`: ObjectId (ref: 'Execution'), required, index: true[cite: 3]
- `workflowId`: ObjectId (ref: 'Workflow'), required[cite: 3]
- `nodeId`: String[cite: 3]
- `agent`: String, enum: `['planner', 'execution', 'validation', 'recovery', 'monitoring']`, required[cite: 3]
- `level`: String, enum: `['info', 'warning', 'error', 'success']`, default: `'info'`[cite: 3]
- `message`: String, required[cite: 3]
- `metadata`: Object[cite: 3]
- `timestamp`: Date, default: Date.now[cite: 3]

### 3.5 Integrations Collection (`Integration.js`)
- `owner`: ObjectId (ref: 'User'), required[cite: 3]
- `provider`: String, enum: `['gmail', 'slack', 'google-sheets', 'discord', 'gemini', 'openrouter']`, required[cite: 3]
- `isConnected`: Boolean, default: false[cite: 3]
- `scopes`: [String][cite: 3]
- `encryptedTokens`: String, required (AES-256 encrypted access & refresh tokens)[cite: 3]
- `iv`: String, required (Initialization vector for AES-256)
- `expiresAt`: Date[cite: 3]
- `createdAt`, `updatedAt`: Timestamps

### 3.6 Notifications Collection (`Notification.js`)
- `owner`: ObjectId (ref: 'User'), required, index: true[cite: 3]
- `workflowId`: ObjectId (ref: 'Workflow')[cite: 3]
- `executionId`: ObjectId (ref: 'Execution')[cite: 3]
- `type`: String, enum: `['info', 'success', 'warning', 'error', 'escalation']`, required[cite: 3]
- `title`: String, required[cite: 3]
- `message`: String, required[cite: 3]
- `isRead`: Boolean, default: false[cite: 3]
- `createdAt`: Date, default: Date.now[cite: 3]

### 3.7 AgentMemory Collection (`AgentMemory.js`)
- `workflowId`: ObjectId (ref: 'Workflow'), required[cite: 3]
- `executionId`: ObjectId (ref: 'Execution'), required[cite: 3]
- `agentId`: String, required[cite: 3]
- `key`: String, required[cite: 3]
- `value`: mongoose.Schema.Types.Mixed, required[cite: 3]
- `confidenceScore`: Number, default: 1.0[cite: 3]
- `createdAt`: Date, default: Date.now[cite: 3]

---

## 4. Multi-Agent Orchestration Chain

The execution engine must process tasks through a 5-agent sequential pipeline:
[Trigger / Webhook]
│
▼

Planner Agent ─────► Validates DAG topological order & assigns confidence score[cite: 3]
│
▼

Execution Agent ───► Fetches email via Gmail API & calls Gemini for invoice extraction[cite: 1, 3]
│
▼

Validation Agent ──► Validates mathematical formula (subtotal + tax == total) & schema fields[cite: 3]
│
├───► [If Invalid / Error] ──► 4. Recovery Agent (Classifies error, retries or escalates)[cite: 3]
│
▼ [If Valid]

Execution Agent ───► Appends row to Google Sheet & sends Slack notification[cite: 3]
│
▼

Monitoring Agent ──► Broadcasts Socket.IO events & persists logs to ExecutionLogs[cite: 3]


1. **Planner Agent (`plannerAgent.js`)**[cite: 3]:
   - Validates node dependency graph.
   - Determines optimal execution route and emits an execution plan with a confidence score[cite: 3].
2. **Execution Agent (`executionAgent.js`)**[cite: 3]:
   - Communicates with third-party integrations (Gmail API, Google Sheets API, Slack)[cite: 1, 3].
   - Calls the LLM engine to extract structured JSON data from invoice documents[cite: 1, 3].
3. **Validation Agent (`validationAgent.js`)**[cite: 3]:
   - Performs structural assertions on extracted JSON (`vendorName`, `invoiceDate`, `subtotal`, `tax`, `totalAmount`)[cite: 3].
   - Validates financial arithmetic: checks if $|(\text{subtotal} + \text{tax}) - \text{totalAmount}| < 0.01$.
4. **Recovery Agent (`recoveryAgent.js`)**[cite: 3]:
   - Classifies runtime errors: `MISSING_FIELDS`, `API_FAILURE`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`[cite: 3].
   - Applies exponential backoff retry for transient errors or flags execution as `FAILED` with an escalation alert[cite: 3].
5. **Monitoring Agent (`monitoringAgent.js`)**[cite: 3]:
   - Writes step-by-step audit records to `ExecutionLogs`[cite: 3].
   - Emits real-time WebSocket payloads: `execution:step`, `execution:log`, `execution:status`[cite: 3].

---

## 5. API Endpoint Specifications

### 5.1 Health & Authentication
- `GET /api/health` - Returns `{ status: 'ok', uptime: Number, timestamp: Date }`[cite: 3].
- `POST /api/auth/register` - Body: `{ name, email, password }`. Hashes password, returns `{ token, user }`[cite: 3].
- `POST /api/auth/login` - Body: `{ email, password }`. Validates credentials, returns `{ token, user }`[cite: 3].
- `GET /api/auth/me` - Protected. Returns profile of current authenticated user[cite: 3].

### 5.2 Workflows
- `GET /api/workflows/dashboard` - Protected. Returns aggregated stats (total workflows, active automations, success rates)[cite: 3].
- `GET /api/workflows` - Protected. Query params: `page`, `limit`, `search`, `status`. Returns paginated workflows[cite: 3].
- `POST /api/workflows` - Protected. Body: `{ name, description, triggerConfig, nodes, edges }`. Creates workflow[cite: 3].
- `POST /api/workflows/generate` - Protected. Body: `{ prompt: String }`. Uses LLM (Gemini/OpenRouter) to generate visual node graph. Falls back to deterministic rule engine if API key missing[cite: 3].
- `GET /api/workflows/:id` - Protected. Returns complete workflow details[cite: 3].
- `PUT /api/workflows/:id` - Protected. Updates existing workflow canvas graph and metadata[cite: 3].
- `POST /api/workflows/:id/duplicate` - Protected. Clones workflow structure with new name[cite: 3].
- `POST /api/workflows/:id/execute` - Protected. Triggers execution run manually or via mock payload[cite: 3].
- `DELETE /api/workflows/:id` - Protected. Deletes workflow[cite: 3].

### 5.3 Executions
- `GET /api/executions` - Protected. Returns paginated execution history with status filters[cite: 3].
- `GET /api/executions/:id` - Protected. Returns execution run record, input/output snapshot, and error details[cite: 3].
- `GET /api/executions/:id/timeline` - Protected. Returns ordered list of `ExecutionLogs`[cite: 3].
- `POST /api/executions/:id/pause` - Protected. Pauses active execution run[cite: 3].
- `POST /api/executions/:id/resume` - Protected. Resumes paused execution run[cite: 3].
- `POST /api/executions/:id/cancel` - Protected. Terminates execution[cite: 3].

### 5.4 Integrations & Notifications
- `GET /api/integrations` - Protected. Returns list of third-party connections and their status[cite: 3].
- `GET /api/integrations/status` - Protected. Health check for all active access tokens[cite: 3].
- `GET /api/integrations/oauth/:provider/start` - Protected. Initiates OAuth flow (Gmail, Google Sheets)[cite: 3].
- `GET /api/integrations/oauth/:provider/callback` - OAuth redirect handler; securely encrypts and stores access/refresh tokens[cite: 3].
- `GET /api/integrations/oauth/error` - Handles OAuth failure redirection[cite: 3].
- `POST /api/integrations` - Protected. Manual webhook integration setup (Slack, Discord)[cite: 3].
- `GET /api/notifications` - Protected. Returns unread user alerts and escalations[cite: 3].

---

## 6. Frontend Pages & UI/UX Structure

The client application uses the Next.js Pages Router with Tailwind CSS and Zustand[cite: 3]:

- `/` - Landing page with platform introduction, feature grid, and login/register CTAs[cite: 3].
- `/login` - Operator authentication screen with validation and error alerts[cite: 3].
- `/register` - Account registration screen[cite: 3].
- `/dashboard` - Main operations console: `MetricGrid` (executions, success rates), active workflows table, and recent activity feed[cite: 3].
- `/workflows` - Workflow list with search, status filters, and creation buttons[cite: 3].
- `/workflows/builder` - Natural language prompt-to-workflow interface with preview and canvas generator[cite: 3].
- `/workflows/[id]` - Full visual editor: Left-hand node palette, center React Flow canvas (`@xyflow/react`), right-hand node configuration drawer, and run/save toolbar[cite: 3].
- `/executions` - Paginated execution history table with status badges and duration metrics[cite: 3].
- `/executions/[id]` - Live execution inspector: Live visual graph highlights, agent badges, real-time log stream via Socket.IO, and pause/resume controls[cite: 3].
- `/integrations` - Connection hub for Gmail, Google Sheets, Slack, Discord with status toggles and reconnect buttons[cite: 3].
- `/settings` - Profile settings, encryption key status, API health, and theme settings[cite: 3].

---

## 7. Folder Structure
agentflow-ai/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppShell/
│   │   │   │   ├── Sidebar.js
│   │   │   │   ├── Header.js
│   │   │   │   └── NotificationDrawer.js
│   │   │   ├── MetricGrid/
│   │   │   ├── NodePalette/
│   │   │   ├── NodeConfigPanel/
│   │   │   ├── WorkflowCanvas/
│   │   │   │   ├── CustomNodes/
│   │   │   │   └── CustomEdges/
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/
│   │   │   ├── _app.js
│   │   │   ├── index.js
│   │   │   ├── login.js
│   │   │   ├── register.js
│   │   │   ├── dashboard.js
│   │   │   ├── integrations.js
│   │   │   ├── settings.js
│   │   │   ├── executions/
│   │   │   │   ├── index.js
│   │   │   │   └── [id].js
│   │   │   └── workflows/
│   │   │       ├── index.js
│   │   │       ├── builder.js
│   │   │       └── [id].js
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   └── workflowStore.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   └── styles/
│   │       └── globals.css
│   ├── package.json
│   └── tailwind.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js
│   │   │   ├── db.js
│   │   │   └── socket.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── workflowController.js
│   │   │   ├── executionController.js
│   │   │   └── integrationController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── workflowRoutes.js
│   │   │   ├── executionRoutes.js
│   │   │   ├── integrationRoutes.js
│   │   │   └── notificationRoutes.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── workflowService.js
│   │   │   ├── executionService.js
│   │   │   ├── aiService.js
│   │   │   └── integrationService.js
│   │   ├── agents/
│   │   │   ├── orchestrator.js
│   │   │   ├── plannerAgent.js
│   │   │   ├── executionAgent.js
│   │   │   ├── validationAgent.js
│   │   │   ├── recoveryAgent.js
│   │   │   └── monitoringAgent.js
│   │   ├── integrations/
│   │   │   ├── baseIntegration.js
│   │   │   ├── gmailIntegration.js
│   │   │   ├── googleSheetsIntegration.js
│   │   │   ├── slackIntegration.js
│   │   │   └── discordIntegration.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Workflow.js
│   │   │   ├── Execution.js
│   │   │   ├── ExecutionLog.js
│   │   │   ├── Integration.js
│   │   │   ├── Notification.js
│   │   │   └── AgentMemory.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── validationMiddleware.js
│   │   ├── queues/
│   │   │   └── executionQueue.js
│   │   └── server.js
│   └── package.json
├── .gitignore
├── README.md
└── spec.md

---

## 8. Development Phases

- **Phase 1: Project Setup, Backend Core & Authentication**[cite: 3]
  - Initialize `client/` and `server/` apps with packages[cite: 3].
  - Configure MongoDB connection, environment loading, and error handling[cite: 2, 3].
  - Implement User model, bcrypt hashing, JWT auth routes, and `authMiddleware`[cite: 3].
  - Create Next.js `AppShell`, Zustand auth store, and `/login`, `/register`, `/dashboard` pages[cite: 3].
- **Phase 2: Workflow Canvas & CRUD Operations**[cite: 3]
  - Build `Workflow` database model and CRUD endpoints[cite: 3].
  - Implement visual React Flow canvas with custom nodes (Trigger, Action, AI, Logic), edge animations, drag-and-drop palette, and node configuration panel[cite: 3].
- **Phase 3: AI Prompt-to-Workflow Generator**[cite: 3]
  - Implement `aiService.js` to parse natural language prompts into DAG graph structures using Gemini API / OpenRouter[cite: 3].
  - Build deterministic fallback generator for invoice operations[cite: 3].
  - Build `/workflows/builder` frontend interface with live graph preview[cite: 3].
- **Phase 4: 5-Agent Execution & Orchestration Engine**[cite: 3]
  - Implement `orchestrator.js` running the 5-agent sequential lifecycle (Planner, Execution, Validation, Recovery, Monitoring)[cite: 3].
  - Implement invoice math verification logic and execution state controls (pause, resume, cancel)[cite: 3].
- **Phase 5: Third-Party OAuth & Bot Integrations**[cite: 3]
  - Implement AES-256 token encryption/decryption utilities using `CREDENTIAL_ENCRYPTION_KEY`[cite: 3].
  - Implement Google OAuth (Gmail API, Google Sheets API) and Slack/Discord webhook dispatchers[cite: 3].
- **Phase 6: Queues, Real-Time WebSockets & Production Deployment**[cite: 2, 3]
  - Integrate BullMQ background worker queues with in-memory fallback[cite: 3].
  - Set up Socket.IO server and client listener for real-time live execution timelines[cite: 3].
  - Deploy backend to Render, frontend to Vercel, and verify cloud database connectivity[cite: 2].

---

## 9. Security & Production Checklist

1. **Zero Secret Leakage**:
   - Add `.env`, `.env.local`, `.env.*.local`, `node_modules/`, and `.DS_Store` to root `.gitignore`[cite: 1, 2].
   - Never commit raw API keys, passwords, or client secrets to GitHub[cite: 1, 2].
2. **Encryption at Rest**:
   - OAuth tokens must be stored encrypted using AES-256-CBC via `CREDENTIAL_ENCRYPTION_KEY`[cite: 3].
   - Passwords must be hashed with `bcryptjs` using a cost factor of 12[cite: 3].
3. **API & Request Hardening**:
   - Secure HTTP headers enabled with `helmet`[cite: 3].
   - CORS restricted strictly to the frontend origin (`CLIENT_URL`)[cite: 2, 3].
   - All controller inputs validated via `express-validator`[cite: 3].
4. **Resilient Error Handling**:
   - Missing third-party credentials return explicit `INTEGRATION_NOT_CONNECTED` or `AUTH_EXPIRED` codes rather than unhandled 500 errors[cite: 3].
   - Backend dynamically listens on `process.env.PORT || 5000` for Render cloud compatibility[cite: 2].