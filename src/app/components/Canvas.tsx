'use client'

import React, {useCallback, useRef, useState} from 'react';
import {
    addEdge,
    Connection,
    Controls, Edge, getConnectedEdges, getIncomers, getOutgoers, HandleType,
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
import {isValidConnection, isValidEdgesFromConnection, push} from "@/app/components/utils";

const Canvas: React.FC = () => {
    const { screenToFlowPosition, addNodes, getInternalNode } = useReactFlow();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const edgeReconnectSuccessful = useRef(true);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [type, nodeName] = useDnD();

    const onConnect = useCallback(
        (conn: Connection) => setEdges((edges) => {
            if(!isValidConnection(conn)) return edges;

            const label = `${`hello`}`;
            // Do not try to add edges between two same node with same positions
            if ((edges as Edge[]).some(ed=> !isValidEdgesFromConnection(conn, ed.id)))
                return edges;
            return addEdge({ ...conn, data: { label }, type: 'process' }, edges) as never;
        }),
        [setEdges, addEdge]
    );

    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeReconnectSuccessful.current = true;
        setEdges((edges) => {
            if(!isValidConnection(newConnection)) return edges;
            // Do not try to add edges between two same node with same positions
            if ((edges as Edge[]).some(ed=> !isValidEdgesFromConnection(newConnection, ed.id)))
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
    const onDragOver = useCallback( (event: React.DragEvent<HTMLDivElement>) => {
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
                if (type === 'annotation') {
                    newElem.data = { ...newElem.data, label: '', isNew: true };
                }
                return groupElements(push(nodes, newElem as never), getInternalNode, setNodes) as never;
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
            return groupElements(nodes as Node[], getInternalNode, setNodes) as never;
        })
    }, [setNodes, getInternalNode]);

    const onNodesDelete = useCallback(
        (deleted: Node[]) => {
            setEdges((edges) =>
                deleted.reduce((acc: Edge[], node: Node) => {
                    const incomers = getIncomers(node, nodes, edges);
                    const outgoers = getOutgoers(node, nodes, edges);
                    const connectedEdges = getConnectedEdges([node], edges);

                    const remainingEdges = acc.filter(
                        (edge) => !connectedEdges.includes(edge as never)
                    );

                    const createdEdges = incomers.flatMap(({ id: source }) =>
                        outgoers.map(({ id: target }) => ({
                            id: `${source}->${target}`,
                            source,
                            target,
                        }))
                    );

                    return [...remainingEdges, ...createdEdges];
                }, edges) as never
            );
        },
        [nodes, edges]
    );

    return (
        <div className="dndflow">
            <div className="tooltip-container">
                <Tooltip/>
            </div>
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
                    // onNodesDelete={onNodesDelete}
                    edges={edges}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                >
                    <Controls/>
                    <MiniMap nodeColor={ElementColor} nodeStrokeWidth={3} zoomable pannable/>
                </ReactFlow>
            </div>
        </div>
    );
};

export default Canvas;