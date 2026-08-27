import React, { useRef, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import TriggerNode from './CustomNodes/TriggerNode';
import AINode from './CustomNodes/AINode';
import LogicNode from './CustomNodes/LogicNode';
import ActionNode from './CustomNodes/ActionNode';
import AnimatedEdge from './CustomEdges/AnimatedEdge';
import { useWorkflowStore } from '../../store/workflowStore';

function FlowCanvas() {
  const reactFlowWrapper = useRef(null);

  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const onConnect = useWorkflowStore((state) => state.onConnect);
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  const addNode = useWorkflowStore((state) => state.addNode);

  // Register Custom Node Types
  const nodeTypes = useMemo(
    () => ({
      triggerNode: TriggerNode,
      aiNode: AINode,
      logicNode: LogicNode,
      actionNode: ActionNode,
    }),
    []
  );

  // Register Custom Edge Types
  const edgeTypes = useMemo(
    () => ({
      animated: AnimatedEdge,
    }),
    []
  );

  // Drag & Drop handlers
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) return;

      if (reactFlowWrapper.current) {
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = {
          x: event.clientX - bounds.left - 100,
          y: event.clientY - bounds.top - 40,
        };
        addNode(nodeType, position);
      }
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        minZoom={0.2}
        maxZoom={2.0}
        defaultEdgeOptions={{
          animated: true,
          type: 'animated',
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#334155"
          gap={24}
          size={1.5}
          variant={BackgroundVariant.Dots}
        />
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          nodeColor={(n) => {
            if (n.type === 'triggerNode') return '#3B82F6';
            if (n.type === 'aiNode') return '#A855F7';
            if (n.type === 'logicNode') return '#10B981';
            return '#10B981';
          }}
          maskColor="rgba(11, 16, 29, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}

export default function WorkflowCanvasWrapper() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
