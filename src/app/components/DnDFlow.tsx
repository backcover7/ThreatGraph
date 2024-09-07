'use client'

import React, { useRef, useCallback } from 'react';
import {
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    useReactFlow,
    Node,
    Edge,
    Connection,
    MarkerType
} from '@xyflow/react';
import Tooltip from './Tooltip';
import { useDnD } from './DnDContext';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `dndnode_${id++}`;

const defaultEdgeOptions = {
    type: 'default',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
    },
    style: {
        strokeWidth: 1,
    },
};

const DnDFlow: React.FC = () => {
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
            if (!type || !nodeName) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: { label: nodeName },
            };
            setNodes((nds) => nds.concat(newNode));
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
                    defaultEdgeOptions={defaultEdgeOptions}
                >
                    <Controls />
                </ReactFlow>
            </div>
            <Tooltip />
        </div>
    );
};

export default DnDFlow;