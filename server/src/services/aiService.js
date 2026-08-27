import env from '../config/env.js';

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
  let model = 'gemini-1.5-pro';
  if (text.includes('flash') || text.includes('fast')) {
    model = 'gemini-1.5-flash';
  } else if (text.includes('claude') || text.includes('openrouter')) {
    model = 'openrouter/anthropic-claude';
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
    description: promptText || 'Autonomous invoice processing workflow generated via Agentflow AI.',
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

  // If Gemini API Key is available, attempt Gemini generation
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert autonomous financial workflow architect for Agentflow_AI.
Given this user prompt: "${prompt}"

Generate a valid visual DAG workflow JSON object conforming to:
{
  "name": "Concise workflow name",
  "description": "Clear workflow description",
  "triggerConfig": { "type": "gmail|webhook|schedule|manual", "config": {} },
  "nodes": [
    {
      "id": "node-1",
      "type": "triggerNode|aiNode|logicNode|actionNode",
      "position": { "x": 100, "y": 150 },
      "data": { "label": "Node Label", ... }
    }
  ],
  "edges": [
    { "id": "edge-1-2", "source": "node-1", "target": "node-2", "animated": true }
  ],
  "tags": ["Tag1", "Tag2"],
  "confidenceScore": 0.96,
  "explanation": "Brief rationale for node placement"
}

Ensure all nodes have increasing x-coordinates (80, 420, 760, 1100). Output STRICT JSON only.`,
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
        if (rawContent) {
          const parsed = JSON.parse(rawContent);
          return {
            ...parsed,
            source: 'Google Gemini 1.5 Pro',
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API generation failed, falling back to rule engine:', err.message);
    }
  }

  // If OpenRouter Key is available, attempt OpenRouter generation
  if (openRouterKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: 'You generate visual node workflow DAG JSONs for Agentflow_AI. Output strictly JSON.',
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
        if (rawContent) {
          const parsed = JSON.parse(rawContent);
          return {
            ...parsed,
            source: 'OpenRouter / Claude 3.5 Sonnet',
          };
        }
      }
    } catch (err) {
      console.warn('OpenRouter API generation failed, falling back to rule engine:', err.message);
    }
  }

  // Fallback to Deterministic Financial Rule Engine
  return generateDeterministicWorkflow(prompt);
};

export default {
  generateWorkflowGraph,
  generateDeterministicWorkflow,
};
