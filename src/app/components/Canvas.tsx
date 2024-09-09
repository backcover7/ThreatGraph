'use client'

import React, {useCallback, useRef, useState} from 'react';
import {
    addEdge,
    Connection,
    Controls, Edge,
    MiniMap,
    Node,
    ReactFlow, reconnectEdge,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import Tooltip from '@/app/components/Tooltip';
import {useDnD} from '@/app/components/DnDContext';
import {detachElement, groupElements} from "@/app/components/nodes/Zone";
import {flowOptions} from "@/app/components/nodes/Flow";
import {ElementColor, ElementNodes, getNewElement} from "@/app/components/nodes/Element";
import {push} from "@/app/components/utils";

const Canvas: React.FC = () => {
    const { screenToFlowPosition, addNodes, getInternalNode } = useReactFlow();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [type, nodeName] = useDnD();

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    const onReconnect = useCallback(
        (oldEdge: Edge, newConnection: Connection) =>
            setEdges((els) => reconnectEdge(oldEdge, newConnection, els) as never),
        [],
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
                return groupElements(push(nodes, newElem as never), getInternalNode) as never;
            });
        },
        [screenToFlowPosition, setNodes, type, nodeName, getInternalNode],
    );

    const onNodeDragStart = useCallback((event: React.MouseEvent, detachedNode: Node) => {
        // Detach node from group
        setNodes(nodes => {
            return detachElement(detachedNode, nodes, getInternalNode);
        });
    }, [getInternalNode]);

    // drag existing element
    const onNodeDragStop = useCallback(() => {
        setNodes((nodes) => {
            return groupElements(nodes as Node[], getInternalNode) as never;
        })
    }, [setNodes, getInternalNode]);

    return (
        <div className="dndflow">
            <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                <ReactFlow
                    className="touch-flow"
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    edgesReconnectable={true}
                    onConnect={onConnect}
                    onReconnect={onReconnect}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onNodeDragStart={onNodeDragStart}
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