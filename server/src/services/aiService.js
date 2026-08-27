import env from '../config/env.js';

/**
 * Helper to strip markdown JSON codeblocks (```json ... ```) from LLM output
 */
const extractJsonFromResponse = (raw) => {
  if (!raw) return null;
  let text = raw.trim();

  // Strip markdown fences
  if (text.startsWith('```')) {
    text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    // Attempt regex extract if preamble text exists
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};

/**
 * Deterministic Financial Rule Engine Fallback
 * Generates structured DAG graph from natural language prompt by parsing intents, triggers, and targets.
 */
export const generateDeterministicWorkflow = (promptText = '') => {
  const text = promptText.toLowerCase();

  // 1. Determine Trigger Type
  let triggerType = 'gmail';
  let triggerLabel = 'Gmail Invoice Ingestion';
  let triggerDescription = 'Monitors incoming emails with invoice attachments';
  let query = 'label:inbox has:attachment filename:pdf invoice';

  if (text.includes('webhook') || text.includes('api') || text.includes('payload')) {
    triggerType = 'webhook';
    triggerLabel = 'Webhook Event Ingestion';
    triggerDescription = 'Listens for external HTTP POST invoice JSON payloads';
    query = 'POST /api/webhooks/invoices';
  } else if (text.includes('schedule') || text.includes('daily') || text.includes('hourly') || text.includes('cron')) {
    triggerType = 'schedule';
    triggerLabel = 'Scheduled AP Reconciliation';
    triggerDescription = 'Executes periodic scan of pending vendor expense records';
    query = 'cron(0 8 * * 1-5)';
  } else if (text.includes('manual') || text.includes('on demand') || text.includes('button')) {
    triggerType = 'manual';
    triggerLabel = 'Manual Trigger';
    triggerDescription = 'Operator initiated execution run';
    query = 'Manual Launch';
  }

  // 2. Determine AI Model & Extraction Schema
  let model = 'gemini-2.5-pro';
  if (text.includes('flash') || text.includes('fast')) {
    model = 'gemini-2.5-flash';
  } else if (text.includes('claude') || text.includes('openrouter')) {
    model = 'openrouter/gpt-4o-mini';
  }

  const extractionFields = ['vendorName', 'invoiceDate', 'subtotal', 'tax', 'totalAmount'];
  if (text.includes('line items') || text.includes('items') || text.includes('sku')) {
    extractionFields.push('lineItems');
  }
  if (text.includes('due date') || text.includes('terms')) {
    extractionFields.push('dueDate');
  }

  // 3. Determine Validation Rule & Tolerance
  let tolerance = 0.01;
  let rule = 'subtotal + tax == totalAmount';
  if (text.includes('discount')) {
    rule = 'subtotal + tax - discount == totalAmount';
  }

  // 4. Determine Action Destination
  let actionType = 'google-sheets';
  let actionLabel = 'Google Sheet & Slack Alert';
  let sheetId = 'Company_Invoices_2026';
  let channel = '#finance-ops';

  if (text.includes('slack') && !text.includes('sheet')) {
    actionType = 'slack';
    actionLabel = 'Slack Notification';
  } else if (text.includes('discord')) {
    actionType = 'discord';
    actionLabel = 'Discord Operations Channel';
    channel = '#ap-invoices';
  }

  // 5. Generate Layout Coordinates for Visual Nodes
  const nodes = [
    {
      id: 'node-trigger-1',
      type: 'triggerNode',
      position: { x: 80, y: 160 },
      data: {
        label: triggerLabel,
        triggerType,
        description: triggerDescription,
        query,
        enabled: true,
      },
    },
    {
      id: 'node-ai-1',
      type: 'aiNode',
      position: { x: 420, y: 160 },
      data: {
        label: 'Gemini Document Parser',
        model,
        temperature: 0.1,
        extractionFields,
        confidenceThreshold: 0.88,
        description: 'Multi-modal OCR & invoice JSON extraction agent',
      },
    },
    {
      id: 'node-logic-1',
      type: 'logicNode',
      position: { x: 760, y: 160 },
      data: {
        label: 'Financial Formula Assertion',
        rule,
        tolerance,
        failAction: 'route_recovery',
        description: `Enforces arithmetic balance (${rule})`,
      },
    },
    {
      id: 'node-action-1',
      type: 'actionNode',
      position: { x: 1100, y: 160 },
      data: {
        label: actionLabel,
        actionType,
        sheetId,
        channel,
        description: 'Commits validated record & dispatches alert',
      },
    },
  ];

  const edges = [
    {
      id: 'edge-1-2',
      source: 'node-trigger-1',
      target: 'node-ai-1',
      animated: true,
      data: { label: 'Inbound Document' },
    },
    {
      id: 'edge-2-3',
      source: 'node-ai-1',
      target: 'node-logic-1',
      animated: true,
      data: { label: 'Extracted JSON' },
    },
    {
      id: 'edge-3-4',
      source: 'node-logic-1',
      target: 'node-action-1',
      animated: true,
      data: { label: 'Validated Record' },
    },
  ];

  // Derive workflow name from prompt
  const cleanedTitle = promptText
    ? promptText.slice(0, 60).replace(/[^\w\s-]/g, '').trim()
    : 'Automated Invoice Pipeline';

  return {
    name: cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1) || 'AI Generated Invoice Workflow',
    description: promptText || 'Autonomous invoice processing workflow generated via LedgerFlow AI.',
    triggerConfig: { type: triggerType, config: { query } },
    nodes,
    edges,
    tags: ['AI-Generated', 'Invoice', triggerType.toUpperCase()],
    confidenceScore: 0.94,
    explanation: `Constructed a 4-node acyclic DAG connecting ${triggerLabel} to ${model} extraction, enforcing math integrity (${rule}), and outputting to ${actionLabel}.`,
    source: 'Deterministic Rule Engine (Reliability Guaranteed)',
  };
};

/**
 * Generate workflow DAG using Gemini API / OpenRouter with rule engine fallback
 */
export const generateWorkflowGraph = async (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Please provide a prompt description to generate workflow graph.');
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const systemInstruction = `You are an expert autonomous financial workflow architect for LedgerFlow_AI.
Given a user request describing financial invoice/expense automation, construct an acyclic DAG visual workflow JSON object conforming EXACTLY to:
{
  "name": "Concise Workflow Title (max 60 chars)",
  "description": "Clear explanation of workflow operation",
  "triggerConfig": {
    "type": "gmail|webhook|schedule|manual",
    "config": { "query": "string" }
  },
  "nodes": [
    {
      "id": "node-1",
      "type": "triggerNode",
      "position": { "x": 80, "y": 160 },
      "data": {
        "label": "Trigger Label",
        "triggerType": "gmail|webhook|schedule|manual",
        "description": "Trigger details",
        "query": "query filter"
      }
    },
    {
      "id": "node-2",
      "type": "aiNode",
      "position": { "x": 420, "y": 160 },
      "data": {
        "label": "Gemini Extraction Agent",
        "model": "gemini-2.5-pro",
        "extractionFields": ["vendorName", "invoiceDate", "subtotal", "tax", "totalAmount", "lineItems"],
        "confidenceThreshold": 0.90
      }
    },
    {
      "id": "node-3",
      "type": "logicNode",
      "position": { "x": 760, "y": 160 },
      "data": {
        "label": "Financial Formula Assertion",
        "rule": "subtotal + tax == totalAmount",
        "tolerance": 0.01
      }
    },
    {
      "id": "node-4",
      "type": "actionNode",
      "position": { "x": 1100, "y": 160 },
      "data": {
        "label": "Google Sheet & Slack",
        "actionType": "google-sheets|slack|discord",
        "sheetId": "Company_Ledger_2026",
        "channel": "#finance-ops"
      }
    }
  ],
  "edges": [
    { "id": "edge-1-2", "source": "node-1", "target": "node-2", "animated": true, "data": { "label": "Document Stream" } },
    { "id": "edge-2-3", "source": "node-2", "target": "node-3", "animated": true, "data": { "label": "Extracted JSON" } },
    { "id": "edge-3-4", "source": "node-3", "target": "node-4", "animated": true, "data": { "label": "Validated Record" } }
  ],
  "tags": ["Invoice", "Operations", "AI-Generated"],
  "confidenceScore": 0.98,
  "explanation": "Brief explanation of how the multi-agent nodes process the request"
}

Ensure node coordinates progress horizontally (x: 80, 420, 760, 1100). OUTPUT STRICT RAW JSON ONLY. No markdown wrapping.`;

  // 1. Primary: Google Gemini API (gemini-2.5-flash / gemini-2.5-pro)
  if (geminiKey) {
    try {
      const geminiModel = 'gemini-2.5-flash';
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemInstruction}\n\nUser Request: "${prompt}"`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = extractJsonFromResponse(rawContent);
        if (parsed && parsed.nodes && parsed.nodes.length > 0) {
          return {
            ...parsed,
            source: 'Google Gemini 2.5 Flash',
          };
        }
      } else {
        const errData = await response.json();
        console.warn('Gemini API returned error:', errData.error?.message);
      }
    } catch (err) {
      console.warn('Gemini API call exception:', err.message);
    }
  }

  // 2. Secondary: OpenRouter API (openai/gpt-4o-mini)
  if (openRouterKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'LedgerFlow AI',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemInstruction,
            },
            {
              role: 'user',
              content: `Generate visual workflow DAG for: "${prompt}"`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content;
        const parsed = extractJsonFromResponse(rawContent);
        if (parsed && parsed.nodes && parsed.nodes.length > 0) {
          return {
            ...parsed,
            source: 'OpenRouter (GPT-4o Mini)',
          };
        }
      } else {
        const errData = await response.json();
        console.warn('OpenRouter API returned error:', errData.error?.message);
      }
    } catch (err) {
      console.warn('OpenRouter API call exception:', err.message);
    }
  }

  // 3. Fallback: Deterministic Financial Rule Engine
  return generateDeterministicWorkflow(prompt);
};

export default {
  generateWorkflowGraph,
  generateDeterministicWorkflow,
};
