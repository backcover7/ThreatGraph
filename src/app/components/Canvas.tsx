'use client'

import React, {useCallback, useRef, useState} from 'react';
import {
    addEdge,
    Connection,
    Controls, Edge, HandleType,
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
import {defaultEdgeOptions, edgeTypes} from "@/app/components/nodes/Dataflow";
import {ElementColor, ElementNodes, getNewElement} from "@/app/components/nodes/Element";
import {getEdgeIdFromConnection, push} from "@/app/components/utils";

const Canvas: React.FC = () => {
    const { screenToFlowPosition, addNodes, getInternalNode } = useReactFlow();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const edgeReconnectSuccessful = useRef(true);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [type, nodeName] = useDnD();

    const onConnect = useCallback(
        (conn: Connection) => setEdges((eds) => {
            const label = `${`hello`}`;
            // Do not try to add edges between two same node with same positions
            if ((eds as Edge[]).some(ed=> ed.id === getEdgeIdFromConnection(conn)))
                return eds;
            return addEdge({ ...conn, data: { label }, type: 'custom' }, eds) as never;
        }),
        [setEdges, addEdge]
    );

    // const onConnect = useCallback(
    //     (params: Connection) => {
    //         // You can set a default label or generate one based on the connection
    //         const label = `Flow ${params.source} -> ${params.target}`;
    //         setEdges((eds) => addEdge({ ...params, data: { label }, type: 'custom' }, eds));
    //     },
    //     [setEdges]
    // );

    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeReconnectSuccessful.current = true;
        setEdges((edges) => {
            // Do not try to add edges between two same node with same positions
            if ((edges as Edge[]).some(ed=> ed.id === getEdgeIdFromConnection(newConnection)))
                return edges;
            return reconnectEdge(oldEdge, newConnection, edges) as never
        });
    },[setEdges]);

    const onReconnectEnd = useCallback((event: MouseEvent | TouchEvent, edge: never, handleType: HandleType) => {
        if (!edgeReconnectSuccessful.current) {
            setEdges((eds) => eds.filter((e) => (e as Edge).id !== (edge as Edge).id));
        }
    }, [setEdges]);

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
                    fitView
                    className="touch-flow"
                    nodes={nodes}
                    nodeTypes={ElementNodes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    edgesReconnectable={true}
                    onConnect={onConnect}
                    onReconnectStart={onReconnectStart}
                    onReconnect={onReconnect}
                    onReconnectEnd={onReconnectEnd}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onNodeDragStart={onNodeDragStart}
                    onNodeDragStop={onNodeDragStop}
                    edges={edges}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
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