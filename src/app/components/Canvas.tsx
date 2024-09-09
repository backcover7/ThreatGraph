'use client'

import React, {useCallback, useRef, useState} from 'react';
import {
    addEdge,
    Connection,
    Controls,
    MiniMap,
    Node,
    ReactFlow,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import Tooltip from '@/app/components/Tooltip';
import {useDnD} from '@/app/components/DnDContext';
import {groupElements} from "@/app/components/nodes/Zone";
import {flowOptions} from "@/app/components/nodes/Flow";
import {ElementColor, ElementNodes, getNewElement} from "@/app/components/nodes/Element";
import {push} from "@/app/components/utils";

const Canvas: React.FC = () => {
    const { screenToFlowPosition, addNodes, getInternalNode } = useReactFlow();
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
                const newElem = getNewElement(type, position, nodeName);
                return groupElements(push(nodes, newElem as never)) as never;
            });
        },
        [screenToFlowPosition, setNodes, type, nodeName ],
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

    const onNodeMouseEnter = useCallback((event: React.MouseEvent, params: Node) => {
        if (isDragging) {
            // TODO if a node is dragged from a zone to a nested zone
            return;
        }
    }, [isDragging, setNodes]);

    const onNodeMouseLeave = useCallback((event: React.MouseEvent, params: Node) => {
        if (isDragging) {
            // Detach node from group
            setNodes(nodes => {
                return nodes.map(n => {
                    if ((n as Node).id === params.id) {
                        // Calculate the new absolute position
                        const parentNode = nodes.find(pn => (pn as Node).id === (n as Node).parentId);
                        const newPosition = parentNode
                            ? {
                                x: (parentNode as Node).position.x + (n as Node).position.x,
                                y: (parentNode as Node).position.y + (n as Node).position.y
                            }
                            : (n as Node).position;

                        // Create the updated node
                        return {
                            ...(n as Node),
                            parentId: undefined,
                            extent: undefined,
                            position: newPosition,
                        };
                    }
                    return n;
                }) as never[];
            });
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
                    onNodeMouseEnter={onNodeMouseEnter}
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