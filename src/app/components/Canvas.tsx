'use client'

import React, { useRef, useCallback } from 'react';
import {
    ReactFlow, MiniMap, Controls,
    addEdge,
    useNodesState, useEdgesState, useReactFlow,
    Node, Edge, Connection,
    MarkerType, XYPosition
} from '@xyflow/react';
import Tooltip from '@/app/components/Tooltip';
import { useDnD } from '@/app/components/DnDContext';
import { groupElements } from "@/app/components/nodes/Zone";
import { flowOptions } from "@/app/components/nodes/Flow";
import { ElementColor, ElementNodes, getNewElement } from "@/app/components/nodes/Element";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const Canvas: React.FC = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition } = useReactFlow();
    const [type, nodeName] = useDnD();

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            if (!type || !nodeName) return;
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newElem = getNewElement(type, position, nodeName);
            groupElements(nodes, position, newElem);
            setNodes((nds) => nds.concat(newElem));
        },
        [screenToFlowPosition, setNodes, type, nodeName],
    );

    return (
        <div className="dndflow">
            <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    fitView
                    defaultEdgeOptions={flowOptions}
                    nodeTypes={ElementNodes}
                >
                    <Controls />
                    <MiniMap nodeColor={ElementColor} nodeStrokeWidth={3} zoomable pannable />
                </ReactFlow>
            </div>
            <Tooltip />
        </div>
    );
};

export default Canvas;