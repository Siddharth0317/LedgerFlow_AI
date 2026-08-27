import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import api from '../services/api';

export const useWorkflowStore = create((set, get) => ({
  workflows: [],
  pagination: { total: 0, page: 1, limit: 10, pages: 1 },
  stats: {
    totalWorkflows: 0,
    activeWorkflows: 0,
    draftWorkflows: 0,
    totalInvoicesProcessed: 1248,
    mathValidationRate: 99.8,
  },
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isLoading: false,
  isSaving: false,
  isDirty: false,
  error: null,

  /**
   * Fetch aggregated dashboard statistics
   */
  fetchDashboardStats: async () => {
    try {
      const res = await api.get('/workflows/dashboard');
      if (res.data?.success) {
        set({ stats: res.data.stats });
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  },

  /**
   * Fetch paginated workflows list with optional filters
   */
  fetchWorkflows: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/workflows', { params });
      if (res.data?.success) {
        set({
          workflows: res.data.workflows,
          pagination: res.data.pagination,
          isLoading: false,
        });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load workflows';
      set({ error: message, isLoading: false });
    }
  },

  /**
   * Fetch single workflow by ID and load nodes/edges into active canvas
   */
  fetchWorkflowById: async (id) => {
    set({ isLoading: true, error: null, currentWorkflow: null });
    try {
      const res = await api.get(`/workflows/${id}`);
      if (res.data?.success) {
        const wf = res.data.workflow;
        set({
          currentWorkflow: wf,
          nodes: wf.nodes || [],
          edges: wf.edges || [],
          selectedNode: null,
          isDirty: false,
          isLoading: false,
        });
        return wf;
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load workflow canvas';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  /**
   * Create a new workflow
   */
  createWorkflow: async (payload = {}) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.post('/workflows', payload);
      if (res.data?.success) {
        const newWf = res.data.workflow;
        set((state) => ({
          workflows: [newWf, ...state.workflows],
          isSaving: false,
        }));
        return { success: true, workflow: newWf };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create workflow';
      set({ error: message, isSaving: false });
      return { success: false, error: message };
    }
  },

  /**
   * Update workflow details or canvas graph
   */
  updateWorkflow: async (id, payload) => {
    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/workflows/${id}`, payload);
      if (res.data?.success) {
        const updated = res.data.workflow;
        set((state) => ({
          currentWorkflow: state.currentWorkflow?._id === id ? updated : state.currentWorkflow,
          workflows: state.workflows.map((w) => (w._id === id ? updated : w)),
          isDirty: false,
          isSaving: false,
        }));
        return { success: true, workflow: updated };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update workflow';
      set({ error: message, isSaving: false });
      return { success: false, error: message };
    }
  },

  /**
   * Save current canvas graph (nodes & edges) to backend
   */
  saveCanvas: async () => {
    const { currentWorkflow, nodes, edges } = get();
    if (!currentWorkflow?._id) return;

    set({ isSaving: true, error: null });
    try {
      const res = await api.put(`/workflows/${currentWorkflow._id}`, {
        nodes,
        edges,
        name: currentWorkflow.name,
        description: currentWorkflow.description,
        status: currentWorkflow.status,
      });

      if (res.data?.success) {
        set({
          currentWorkflow: res.data.workflow,
          isDirty: false,
          isSaving: false,
        });
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save canvas';
      set({ error: message, isSaving: false });
      return { success: false, error: message };
    }
  },

  /**
   * Duplicate workflow
   */
  duplicateWorkflow: async (id) => {
    try {
      const res = await api.post(`/workflows/${id}/duplicate`);
      if (res.data?.success) {
        const cloned = res.data.workflow;
        set((state) => ({
          workflows: [cloned, ...state.workflows],
        }));
        return { success: true, workflow: cloned };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to duplicate workflow';
      return { success: false, error: message };
    }
  },

  /**
   * Delete workflow
   */
  deleteWorkflow: async (id) => {
    try {
      const res = await api.delete(`/workflows/${id}`);
      if (res.data?.success) {
        set((state) => ({
          workflows: state.workflows.filter((w) => w._id !== id),
        }));
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete workflow';
      return { success: false, error: message };
    }
  },

  /**
   * React Flow node changes handler
   */
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    });
  },

  /**
   * React Flow edge changes handler
   */
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  /**
   * React Flow connection handler
   */
  onConnect: (connection) => {
    const edge = {
      ...connection,
      id: `edge-${Date.now()}`,
      animated: true,
      type: 'smoothstep',
    };
    set({
      edges: addEdge(edge, get().edges),
      isDirty: true,
    });
  },

  /**
   * Add a new node to the canvas
   */
  addNode: (nodeType, position = { x: 250, y: 150 }) => {
    const id = `node-${Date.now()}`;
    let defaultData = { label: 'New Node' };

    switch (nodeType) {
      case 'triggerNode':
        defaultData = {
          label: 'Gmail Ingestion Trigger',
          triggerType: 'gmail',
          description: 'Monitors incoming invoice emails',
          query: 'has:attachment filename:pdf invoice',
          enabled: true,
        };
        break;
      case 'aiNode':
        defaultData = {
          label: 'Gemini Invoice Extraction',
          model: 'gemini-1.5-pro',
          temperature: 0.1,
          extractionFields: ['vendorName', 'invoiceDate', 'subtotal', 'tax', 'totalAmount'],
          confidenceThreshold: 0.85,
        };
        break;
      case 'logicNode':
        defaultData = {
          label: 'Math Assertion',
          rule: 'subtotal + tax == totalAmount',
          tolerance: 0.01,
          failAction: 'route_recovery',
        };
        break;
      case 'actionNode':
        defaultData = {
          label: 'Google Sheet & Slack',
          actionType: 'google-sheets',
          sheetId: 'Auto-Detect',
          channel: '#finance-ops',
        };
        break;
      default:
        break;
    }

    const newNode = {
      id,
      type: nodeType,
      position,
      data: defaultData,
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNode: newNode,
      isDirty: true,
    }));
  },

  /**
   * Update data attributes of a specific node
   */
  updateNodeData: (nodeId, updatedData) => {
    set((state) => {
      const updatedNodes = state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...updatedData },
          };
        }
        return node;
      });

      const updatedSelected =
        state.selectedNode?.id === nodeId
          ? { ...state.selectedNode, data: { ...state.selectedNode.data, ...updatedData } }
          : state.selectedNode;

      return {
        nodes: updatedNodes,
        selectedNode: updatedSelected,
        isDirty: true,
      };
    });
  },

  /**
   * Delete node and attached edges
   */
  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
      isDirty: true,
    }));
  },

  /**
   * Set active selected node for inspector drawer
   */
  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },

  /**
   * Clear error message
   */
  clearError: () => set({ error: null }),
}));

export default useWorkflowStore;
