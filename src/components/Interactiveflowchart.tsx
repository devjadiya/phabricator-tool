"use client";

import React, { useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

// --- Dagre Layouting Setup ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the Dagre node position (anchor=center) to the React Flow anchor (top-left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};

// --- The Flowchart Component ---
interface InteractiveFlowchartProps {
  data: {
    nodes: Node[];
    edges: Edge[];
  };
}

const InteractiveFlowchart: React.FC<InteractiveFlowchartProps> = ({
  data,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // This effect calculates the layout when the API data changes.
  useEffect(() => {
    if (data && data.nodes && data.edges) {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(data.nodes, data.edges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [data, setNodes, setEdges]);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="text-center text-gray-400 p-4">
        No flowchart data available.
      </div>
    );
  }

  return (
    <div
      className="w-full h-full rounded-lg"
      style={{ backgroundColor: "#111827" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        proOptions={{ hideAttribution: true }} // Hides the "React Flow" attribution
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};

export default InteractiveFlowchart;
