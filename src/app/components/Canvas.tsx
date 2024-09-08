'use client'

import React, { useRef, useCallback } from 'react';
import {
    ReactFlow, MiniMap, Controls, Connection,
    addEdge,
    useNodesState, useEdgesState, useReactFlow,
} from '@xyflow/react';
import Tooltip from '@/app/components/Tooltip';
import { useDnD } from '@/app/components/DnDContext';
import { groupElements } from "@/app/components/nodes/Zone";
import { flowOptions } from "@/app/components/nodes/Flow";
import {ElementColor, ElementNodes, getElementId, getNewElement} from "@/app/components/nodes/Element";

const Canvas: React.FC = () => {
    const { screenToFlowPosition } = useReactFlow();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [type, nodeName] = useDnD();

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        []
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

            const newElem =  getNewElement(type, position, nodeName);
            groupElements(nodes, position, newElem);
            setNodes((nds) => nds.concat([newElem as never]));
        },
        [screenToFlowPosition, setNodes, type, nodeName, nodes],
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