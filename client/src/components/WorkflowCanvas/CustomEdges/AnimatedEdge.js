import React from 'react';
import { getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';

export default function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      {/* Background shadow glow path */}
      <path
        id={`${id}-glow`}
        style={{
          ...style,
          stroke: '#6366F1',
          strokeWidth: 4,
          strokeOpacity: 0.15,
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />

      {/* Main animated connecting line */}
      <path
        id={id}
        style={{
          ...style,
          stroke: '#818CF8',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        }}
        className="react-flow__edge-path animate-pulse-slow"
        d={edgePath}
      />

      {/* Optional Edge Label */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan px-2 py-0.5 rounded-full bg-[#0E1424] border border-indigo-500/30 text-[9px] font-mono text-indigo-300 shadow-sm"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
