# Stateful Agents

Stateful Agents are autonomous analytics units within the Whale Alert Network that maintain persistent memory, execute multi-step analysis tasks, and act on predefined conditions without requiring continuous user interaction.

---

## What Is a Stateful Agent?

A Stateful Agent is a process that:

1. **Maintains state** across multiple execution cycles (not just a single request/response)
2. **Subscribes to live data streams** (whale events, signals, market data)
3. **Executes conditional logic** when configured triggers are met
4. **Takes actions**  sending alerts, executing trades via gasless meta-transactions, updating dashboards
5. **Persists memory** between sessions via Redis (hot memory) and PostgreSQL (cold memory)

Unlike a webhook (which receives events passively), an agent actively monitors, correlates, and decides.

---

## Agent Architecture

```

                         AGENT RUNTIME                            
                                                                  
             
    Data Feed    Condition      Action Engine      
    (WebSocket)      Evaluator                             
            Alert dispatch     
                                          Gasless TX          
                           Webhook POST       
     Memory                  Dashboard upd.     
     Layer                                
    Redis (hot)                                                  
    PG (cold)                                                    
                                                    

```

---

## Memory Architecture

Agents use a two-tier memory system optimized for different access patterns:

### Hot Memory (Redis)

Hot memory holds the agent's working state: recent event window, running statistics, pending trigger evaluations.

```typescript
interface AgentHotMemory {
  agentId: string;
  // Rolling event window (last N events the agent has seen)
  eventWindow: WhaleEvent[];
  // Running Z-score statistics for this agent's tracked assets
  stats: Record<string, { mean: number; stdDev: number; n: number }>;
  // Pending trigger evaluation state
  pendingTriggers: TriggerState[];
  // Last execution timestamp
  lastTickAt: number;
  // TTL: auto-expires if agent is not ticked for 1 hour
}
```

Redis keys are namespaced: `agent:{agentId}:state` with a 3600-second TTL. If the agent process restarts or the TTL expires, state is rehydrated from cold memory.

### Cold Memory (PostgreSQL)

Cold memory stores the agent's full history, configuration, and decisions for audit trail purposes:

```prisma
model Agent {
  id            String    @id @default(cuid())
  walletAddress String
  name          String
  config        Json      // AgentConfig object
  status        String    // 'active' | 'paused' | 'terminated'
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  executions    AgentExecution[]
}

model AgentExecution {
  id          String   @id @default(cuid())
  agentId     String
  trigger     String   // Which trigger fired
  payload     Json     // Event data that matched
  actions     Json[]   // Actions taken
  durationMs  Int
  executedAt  DateTime @default(now())
}
```

---

## Agent Configuration

Each agent is defined by a configuration object:

```typescript
interface AgentConfig {
  // Identification
  name: string;
  description?: string;

  // Data subscription
  subscription: {
    networks: NetworkId[];
    tokens?: string[];
    minUsd?: number;
    signalTypes?: SignalType[];
  };

  // Trigger conditions (all must be true for OR  any one must be true)
  triggers: AgentTrigger[];
  triggerLogic: 'AND' | 'OR';  // default: 'OR'

  // Actions to execute when triggered
  actions: AgentAction[];

  // Memory configuration
  memory: {
    windowSize: number;       // Number of events in rolling window
    statsPeriodMs: number;    // Period for rolling statistics (default: 3_600_000)
    maxExecutionsPerHour: number; // Throttle to prevent action spam (default: 10)
  };
}

interface AgentTrigger {
  type: 'anomaly_score' | 'amount_usd' | 'signal_confidence' | 'direction' | 'address_match' | 'frequency';
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq' | 'contains';
  value: number | string;
  // For frequency triggers: N events in T milliseconds
  frequency?: { count: number; windowMs: number };
}

interface AgentAction {
  type: 'telegram' | 'webhook' | 'email' | 'gasless_trade' | 'dashboard_alert';
  config: Record<string, any>;
  // Retry behavior for failed actions
  maxRetries?: number;
  retryDelayMs?: number;
}
```

---

## Predefined Agent Templates

### 1. Whale Surge Monitor

Fires when 3+ whale events occur on the same token within 30 minutes.

```typescript
const whaleSurgeAgent: AgentConfig = {
  name: 'USDC Surge Monitor',
  subscription: {
    networks: ['ethereum', 'polygon'],
    tokens: ['USDC'],
    minUsd: 5_000_000
  },
  triggers: [{
    type: 'frequency',
    operator: 'gte',
    value: 3,
    frequency: { count: 3, windowMs: 30 * 60 * 1000 }
  }],
  triggerLogic: 'OR',
  actions: [{
    type: 'telegram',
    config: { chatId: '-100xxxx', message: ' USDC SURGE DETECTED  {{count}} whales in 30min' }
  }],
  memory: { windowSize: 50, statsPeriodMs: 3_600_000, maxExecutionsPerHour: 5 }
};
```

### 2. Smart Money Entry Alert

Fires when a smart money wallet enters a Polymarket position.

```typescript
const smartMoneyAgent: AgentConfig = {
  name: 'Smart Money Tracker',
  subscription: {
    networks: ['polygon'],
    signalTypes: ['smart_money_entry']
  },
  triggers: [{
    type: 'signal_confidence',
    operator: 'gte',
    value: 75
  }],
  triggerLogic: 'OR',
  actions: [{
    type: 'webhook',
    config: {
      url: 'https://your-server.com/agent-alerts',
      method: 'POST',
      includeFullPayload: true
    }
  }],
  memory: { windowSize: 20, statsPeriodMs: 3_600_000, maxExecutionsPerHour: 20 }
};
```

### 3. Liquidation Risk Watcher

Fires when a tracked wallet health factor drops below 1.05.

```typescript
const liquidationWatcherAgent: AgentConfig = {
  name: 'Liquidation Proximity Alert',
  subscription: {
    networks: ['ethereum'],
    tokens: ['WBTC', 'ETH', 'stETH']
  },
  triggers: [{
    type: 'anomaly_score',
    operator: 'gte',
    value: 5.0
  }],
  triggerLogic: 'OR',
  actions: [
    {
      type: 'telegram',
      config: { chatId: '-100xxxx', message: '️ HIGH ANOMALY SCORE: {{anomalyScore}} on {{token}}' }
    },
    {
      type: 'dashboard_alert',
      config: { severity: 'critical', color: 'red' }
    }
  ],
  memory: { windowSize: 100, statsPeriodMs: 3_600_000, maxExecutionsPerHour: 15 }
};
```

---

## Agent API

### Create an Agent

```bash
POST /api/v1/agents
Authorization: Bearer wha_live_xxx
Content-Type: application/json

{
  "name": "My Whale Monitor",
  "config": { ... AgentConfig ... }
}
```

**Response `201`:**
```json
{ "id": "agent_01HX...", "status": "active", "createdAt": "..." }
```

### Manage Agents

```bash
GET    /api/v1/agents            # List all agents
GET    /api/v1/agents/:id        # Get agent details + recent executions
PUT    /api/v1/agents/:id        # Update configuration
PATCH  /api/v1/agents/:id/pause  # Pause agent
PATCH  /api/v1/agents/:id/resume # Resume agent
DELETE /api/v1/agents/:id        # Terminate agent
```

### Agent Execution Log

```bash
GET /api/v1/agents/:id/executions?limit=50&page=1
```

**Response:**
```json
{
  "data": [
    {
      "id": "exec_01HX...",
      "trigger": "frequency",
      "payload": { "count": 4, "events": ["wh_01...", "wh_02..."] },
      "actions": [{ "type": "telegram", "status": "delivered", "durationMs": 142 }],
      "durationMs": 148,
      "executedAt": "2026-03-30T19:40:22.000Z"
    }
  ]
}
```

---

## Gasless Action Execution

Agents with the `gasless_trade` action type can execute on-chain transactions on behalf of the user without requiring the user to sign each transaction in real time. This uses **EIP-712 meta-transactions**:

1. At agent creation, the user signs a broad permission (the "permit") using their wallet
2. The permit is stored encrypted in the system vault
3. When the agent triggers, the relayer decrypts the permit and submits the transaction with the user's pre-authorized signature
4. The gas cost is covered by the relayer (reimbursed from the user's platform balance)

This capability is available exclusively to PRO and ELITE plan holders and requires explicit opt-in via the **Enable Gasless Execution** setting in the dashboard.

---

## Agent Limits by Plan

| Plan | Max Agents | Max Actions/Hour | Gasless Execution | Memory Window |
|---|---|---|---|---|
| FREE | 0 |  |  |  |
| STANDARD | 0 |  |  |  |
| STARTER | 2 | 10 |  | 50 events |
| PRO | 10 | 50 |  | 500 events |
| ELITE | Unlimited | Unlimited |  | Unlimited |
