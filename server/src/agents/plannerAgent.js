/**
 * Planner Agent (Section 4.1)
 * Validates DAG topological order, checks for cycles, and emits an execution plan with confidence score.
 */
export const runPlannerAgent = async ({ nodes = [], edges = [] }) => {
  if (!nodes || nodes.length === 0) {
    throw new Error('PLANNER_ERROR: Cannot plan execution for empty workflow graph.');
  }

  // 1. Build Adjacency List & In-Degree Map
  const inDegree = new Map();
  const adjList = new Map();

  nodes.forEach((node) => {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  });

  edges.forEach((edge) => {
    if (adjList.has(edge.source) && inDegree.has(edge.target)) {
      adjList.get(edge.source).push(edge.target);
      inDegree.set(edge.target, inDegree.get(edge.target) + 1);
    }
  });

  // 2. Kahn's Algorithm for Topological Sort
  const queue = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  const executionOrder = [];
  while (queue.length > 0) {
    const current = queue.shift();
    executionOrder.push(current);

    const neighbors = adjList.get(current) || [];
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  // 3. Cycle Detection
  const hasCycle = executionOrder.length !== nodes.length;
  if (hasCycle) {
    throw new Error('PLANNER_CYCLE_DETECTED: Graph contains recursive circular dependencies.');
  }

  // 4. Map ordered nodes
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const orderedNodes = executionOrder.map((id) => nodeMap.get(id)).filter(Boolean);

  // 5. Calculate Plan Confidence Score
  const hasTrigger = orderedNodes.some((n) => n.type === 'triggerNode');
  const hasExtraction = orderedNodes.some((n) => n.type === 'aiNode');
  const hasValidation = orderedNodes.some((n) => n.type === 'logicNode');
  const hasAction = orderedNodes.some((n) => n.type === 'actionNode');

  let confidenceScore = 0.85;
  if (hasTrigger && hasExtraction && hasValidation && hasAction) {
    confidenceScore = 0.99;
  } else if (hasTrigger && (hasExtraction || hasAction)) {
    confidenceScore = 0.92;
  }

  return {
    success: true,
    confidenceScore,
    totalSteps: orderedNodes.length,
    orderedNodes,
    executionPlan: {
      dagVerified: true,
      hasTrigger,
      hasExtraction,
      hasValidation,
      hasAction,
      steps: orderedNodes.map((n, idx) => ({
        step: idx + 1,
        nodeId: n.id,
        type: n.type,
        label: n.data?.label || n.type,
      })),
    },
  };
};

export default { runPlannerAgent };
