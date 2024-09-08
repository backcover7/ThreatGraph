'use client'

import React, { useRef, useCallback } from 'react';
import {
    ReactFlow, MiniMap, Controls, Connection,
    addEdge,
    useNodesState, useEdgesState, useReactFlow,
    Node, XYPosition,
} from '@xyflow/react';
import Tooltip from '@/app/components/Tooltip';
import { useDnD } from '@/app/components/DnDContext';
import { groupElements, isNodeCompletelyInsideZone } from "@/app/components/nodes/Zone";
import { flowOptions } from "@/app/components/nodes/Flow";
import { ElementColor, ElementNodes, getElementId, getNewElement } from "@/app/components/nodes/Element";
import { push } from "@/app/components/utils";

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

            const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

            setNodes((nds) => {
                const zoneNodes = nds.filter(node => (node as Node).type === 'group');
                const parentZone = zoneNodes.find(zoneNode => isNodeCompletelyInsideZone({ position, style: { width: 1, height: 1 } } as Node, zoneNode));

                let newPosition: XYPosition = position;
                let parentNode: string | undefined = undefined;

                if (parentZone) {
                    newPosition = {
                        x: position.x - (parentZone as Node).position.x,
                        y: position.y - (parentZone as Node).position.y,
                    };
                    parentNode = (parentZone as Node).id;
                }

                const newElem = getNewElement(type, newPosition, nodeName, parentNode);

                return groupElements(push(nds, newElem as never)) as never;
            });
        },
        [screenToFlowPosition, setNodes, type, nodeName],
    );

    const onNodeDragStop = useCallback(() => {
        setNodes((nds) => groupElements(nds as Node[]) as never)
    }, [setNodes]);

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
                    onNodeDragStop={onNodeDragStop}
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