'use client'

import React, {useCallback, useRef, useState} from 'react';
import {
    addEdge, Background, BackgroundVariant,
    Connection, ControlButton,
    Controls, Edge, HandleType,
    MiniMap,
    Node, Panel,
    ReactFlow, reconnectEdge,
    useEdgesState,
    useNodesState,
    useReactFlow, ViewportPortal,
} from '@xyflow/react';
import Tooltip from '@/app/components/Tooltip';
import {useDnD} from '@/app/components/DnDContext';
import {detachElement, groupElements} from "@/app/components/nodes/ZoneNode";
import {defaultEdgeOptions, edgeTypes} from "@/app/components/nodes/DataflowEdge";
import {ElementColor, ElementNodes, getNewElement} from "@/app/components/nodes/ElementNode";
import {isValidEdgesFromConnection, push} from "@/app/components/utils";
import {FaWandMagicSparkles} from "react-icons/fa6";
import {RxQuestionMarkCircled} from "react-icons/rx";
import {HiQuestionMarkCircle} from "react-icons/hi";

const Canvas: React.FC = () => {
    const { screenToFlowPosition, addNodes, getInternalNode } = useReactFlow();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const edgeReconnectSuccessful = useRef(true);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [type, nodeName] = useDnD();
    const [colorMode, setColorMode] = useState<ColorMode>('light'); // TODO

    const isValidConnection = (connection) => connection.source !== connection.target;

    const onConnect = useCallback(
        (conn: Connection) => setEdges((edges) => {
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
            const newElem = getNewElement(type, position, nodeName);
            if (type === 'annotation') {
                newElem.data = { ...newElem.data, label: '', isNew: true };
            }

            if (nodes.length == 0) {
                addNodes(newElem);
            } else {
                setNodes((nodes) => {
                    return groupElements(push(nodes, newElem as never), getInternalNode, setNodes) as never;
                });
            }
        },
        [nodes, screenToFlowPosition, setNodes, type, nodeName, getInternalNode],
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

    const onChangeDarkMode: ChangeEventHandler<HTMLSelectElement> = (evt) => {
        setColorMode(evt.target.value as ColorMode);
    };

    return (
        <div className="dndflow">
            <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                <ReactFlow
                    className="touch-flow"
                    colorMode={colorMode}
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
                    isValidConnection={isValidConnection}
                    style={{cursor: 'default'}}
                >
                    <Controls>
                        {/**TODO**/}
                        <ControlButton onClick={() => alert('This is ZoneZone')}>
                            <HiQuestionMarkCircle />
                        </ControlButton>
                    </Controls>
                    <MiniMap nodeColor={ElementColor} nodeStrokeWidth={1} zoomable pannable/>
                    <Panel position='top-left'>
                        <div>This is for icon bar TODO</div>
                    </Panel>
                    <Panel position="top-center">
                        <div className="tooltip-container">
                            <Tooltip/>
                        </div>
                    </Panel>
                    <Panel position='top-right'>
                        <div>
                            This is for run button TODO
                        </div>
                        <div>
                            This is for properties bar TODO
                        </div>
                        <div>
                            This is for threat bar TODO
                        </div>
                    </Panel>
                    <Background color="#a5b0fa" variant={BackgroundVariant.Cross} gap={30} />
                    <Panel position='bottom-center'>
                        <div>This is for run background settings like dark mode TODO</div>
                    </Panel>
                </ReactFlow>
            </div>
        </div>
    );
};

export default Canvas;