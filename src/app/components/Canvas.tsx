'use client'

import React, {useCallback, useRef, useState} from 'react';
import {
    addEdge, Background, BackgroundVariant,
    Connection, ControlButton,
    Controls, Edge, HandleType,
    MiniMap,
    Node, NodeTypes, Panel,
    ReactFlow, reconnectEdge,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import GeneralTools from '@/app/components/toolbar/GeneralTools';
import {useDnD} from '@/app/components/DnDContext';
import {detachElement, groupElements} from "@/app/components/nodes/ZoneNode";
import {defaultEdgeOptions, edgeTypes} from "@/app/components/nodes/DataflowEdge";
import {ElementColor, ElementNodes, getNewElement} from "@/app/components/nodes/ElementNode";
import {push} from "@/app/components/utils";
import {HiQuestionMarkCircle} from "react-icons/hi";
import {IoPlayCircle} from "react-icons/io5";
import BuiltInTools from "@/app/components/toolbar/BuiltInTools";

const Canvas: React.FC = () => {
    const { screenToFlowPosition, addNodes, getInternalNode, getEdges } = useReactFlow();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const edgeReconnectSuccessful = useRef(true);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [type, data] = useDnD();

    const isValidConnection = useCallback((connection: Connection | Edge) => {
        const { source, sourceHandle, target, targetHandle } = connection as Connection;

        // Check if source and target are the same
        if (source === target) {
            return false;
        }

        const createEdgeId = (start: string, startHandle: string | null, end: string, endHandle: string | null) =>
            `xy-edge__${start}${startHandle ?? ''}-${end}${endHandle ?? ''}`;

        const newEdgeId = createEdgeId(source, sourceHandle, target, targetHandle);
        const reverseEdgeId = createEdgeId(
            target,
            (targetHandle as string)?.replace('target', 'source'),
            source,
            (sourceHandle as string)?.replace('source', 'target')
        );

        // Check if the edge already exists
        return !(edges as Edge[]).some(edge =>
            edge.id === newEdgeId || edge.id === reverseEdgeId
        );
    }, [edges]);

    const onConnect = useCallback(
        (conn: Connection) => setEdges((edges) => {
            return addEdge({ ...conn, type: 'process' }, edges) as never;
        }),
        [setEdges]
    );

    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeReconnectSuccessful.current = true;
        setEdges((edges) => {
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

    // Check if process node is drop on edge. If so, turn it to a child div of EdgeLabelRenderer
    const checkDropOnEdge = (x: number, y: number) => {
        return getEdges().find(edge => {
            const edgeElement = document.querySelector(`[data-testid="rf__edge-${edge.id}"]`);
            if (edgeElement) {
                const rect = edgeElement.getBoundingClientRect();
                return (
                    x >= rect.left &&
                    x <= rect.right &&
                    y >= rect.top &&
                    y <= rect.bottom
                );
            }
            return false;
        });
    };

    // Drop new element
    const onDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            if (!type) return;

            const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const newElem = getNewElement(type, position, data);

            const droppedOnEdge = checkDropOnEdge(event.clientX, event.clientY);

            if (droppedOnEdge && type === 'process') {
                // Update the edge to show ProcessComponent
                setEdges(edges => (edges as Edge[]).map(edge =>
                    edge.id === droppedOnEdge.id
                        ? { ...edge, data: { ...edge.data, process: data, isProcessNode: true } }
                        : edge
                ) as never);
            } else {
                // Add node as usual
                if (nodes.length === 0) {
                    addNodes(newElem);
                } else {
                    setNodes((nodes) => {
                        return groupElements(push(nodes, newElem as never), getInternalNode, setNodes) as never;
                    });
                }
            }
        },
        [nodes, screenToFlowPosition, setNodes, type, data, getInternalNode, getEdges, setEdges, addNodes]
    );

    const onNodeDragStart = useCallback((event: React.MouseEvent, detachedNode: Node) => {
        // Detach node from group
        setNodes(nodes => {
            return detachElement(detachedNode, nodes, getInternalNode);
        });
    }, [getInternalNode]);

    // drag existing element
    const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
        const droppedOnEdge = checkDropOnEdge(event.clientX, event.clientY);

        if (droppedOnEdge && node.type === 'process') {
            // Update the edge to show ProcessComponent
            setEdges(edges => (edges as Edge[]).map(edge =>
                edge.id === droppedOnEdge.id ? { ...edge, data: { ...edge.data, process: node.data, isProcessNode: true } } : edge
            ) as never);

            // Remove the dragged process node
            setNodes(nodes => (nodes as Node[]).filter(n => n.id !== node.id) as never);
        } else {
            // Group elements as before
            setNodes((nodes) => groupElements(nodes as Node[], getInternalNode, setNodes) as never);
        }
    }, [setNodes, setEdges, getInternalNode]);

    const runAnalysis = () => {

    }

    return (
        <div className="dndflow">
            <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                <ReactFlow
                    // fitView
                    className="touch-flow"
                    nodes={nodes}
                    nodeTypes={ElementNodes}
                    onNodesChange={onNodesChange}
                    isValidConnection={isValidConnection}
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
                    style={{cursor: 'default'}}
                >
                    <Controls>
                        {/**TODO**/}
                        <ControlButton onClick={() => alert('This is ZoneZone')}>
                            <HiQuestionMarkCircle />
                        </ControlButton>
                    </Controls>
                    <MiniMap nodeColor={ElementColor} nodeStrokeWidth={1} zoomable pannable />
                    <Panel position='top-left'>
                        <div style={{
                            width: '50px',
                            height: '100vh',
                            borderRight: '1px solid #ccc',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            padding: '10px 0'
                        }}>
                            <BuiltInTools />
                        </div>
                    </Panel>
                    <Panel position='top-right'>
                        <div style={{
                            width: '300px',
                            height: '100vh',
                            borderLeft: '1px solid #ccc',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '10px'
                        }}>
                            <div style={{
                                zIndex: 9999,
                                display: 'flex',
                                background: '#fcfcfc',
                                width: '50px',
                                height: '30px',
                                border: 1,
                                stopColor: 'black'
                            }}>
                                <button onClick={runAnalysis}>
                                    <IoPlayCircle />
                                </button>
                                {/*TODO progress*/}
                            </div>
                            <div>This is for properties bar TODO</div>
                            <div>This is for threat bar TODO</div>
                        </div>
                    </Panel>
                    <Panel position="bottom-center">
                        <div className="toolbar-container">
                            <GeneralTools/>
                        </div>
                    </Panel>
                    <Background
                        color="#00000" variant={BackgroundVariant.Cross} gap={30}
                    />
                    <Panel position='top-center'>
                        <div>This is for run background settings like dark mode TODO</div>
                    </Panel>
                </ReactFlow>
            </div>
        </div>
    );
};

export default Canvas;