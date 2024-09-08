'use client'

import React, {useRef, useCallback, useState} from 'react';
import {
    ReactFlow, MiniMap, Controls, Connection,
    addEdge,
    useNodesState, useEdgesState, useReactFlow,
    Node, XYPosition, NodeMouseHandler,
} from '@xyflow/react';
import Tooltip from '@/app/components/Tooltip';
import { useDnD } from '@/app/components/DnDContext';
import { groupElements, isNodeCompletelyInsideZone } from "@/app/components/nodes/Zone";
import { flowOptions } from "@/app/components/nodes/Flow";
import { ElementColor, ElementNodes, getElementId, getNewElement } from "@/app/components/nodes/Element";
import { push } from "@/app/components/utils";

const Canvas: React.FC = () => {
    const { screenToFlowPosition, addNodes } = useReactFlow();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [type, nodeName] = useDnD();
    const [isDragging, setIsDragging] = useState(false);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    // Drag new element
    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Drop new element
    const onDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            if (!type || !nodeName) return;

            const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

            setNodes((nodes) => {
                const zoneNodes = nodes.filter(node => (node as Node).type === 'group');
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

                return groupElements(push(nodes, newElem as never)) as never;
            });
        },
        [screenToFlowPosition, setNodes, type, nodeName],
    );

    const onNodeDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    // drag existing element
    const onNodeDragStop = useCallback(() => {
        setIsDragging(false);
        setNodes((nodes) => {
            return groupElements(nodes as Node[]) as never;
        })
    }, [setNodes]);

    const onNodeMouseLeave = useCallback((event: React.MouseEvent, params: Node) => {
        if (isDragging) {
            // Detach node from group
            setNodes(nodes => {
                return nodes.map(n => {
                    if ((n as Node).id === params.id) {
                        // TODO node is dragged out of group, need to reassign a new position
                        // Calculate the new absolute position
                        const parentNode = nodes.find(pn => (pn as Node).id === (n as Node).parentId);
                        const newPosition = parentNode
                            ? {
                                x: (parentNode as Node).position.x + (n as Node).position.x,
                                y: (parentNode as Node).position.y + (n as Node).position.y
                            }
                            : (n as Node).position;

                        // Create the updated node
                        const updatedNode = {
                            ...(n as Node),
                            parentId: undefined,
                            extent: undefined,
                            position: newPosition,
                            positionAbsolute: newPosition
                        };

                        console.log('Node detached from group:', updatedNode.id);
                        return updatedNode;
                    }
                    return n;
                }) as never[];
            });
            console.log('Node is being dragged and left its parent group');
        }
    }, [isDragging, setNodes]);

    return (
        <div className="dndflow">
            <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onNodeDragStart={onNodeDragStart}
                    onNodeDragStop={onNodeDragStop}
                    onNodeMouseLeave={onNodeMouseLeave}
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