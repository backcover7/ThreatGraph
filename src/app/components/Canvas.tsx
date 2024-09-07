'use client'

import React, { useRef, useCallback } from 'react';
import {
    ReactFlow,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    useReactFlow,
    Node,
    Edge,
    Connection,
    MarkerType,
    XYPosition
} from '@xyflow/react';
import Tooltip from '@/app/components/Tooltip';
import { useDnD } from '@/app/components/DnDContext';
import ZoneNode from "@/app/components/nodes/Zone";
import EntityNode from "@/app/components/nodes/Entity";
import DatastoreNode from "@/app/components/nodes/Datastore";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const getId = () => crypto.randomUUID();

const defaultEdgeOptions = {
    type: 'default',
    animated: true,
    label: 'process',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
    },
    style: {
        strokeWidth: 1,
    },
};

const nodeColor = (node: Node): string => {
    switch (node.type) {
        case 'input':
            return '#d9fdde';
        case 'output':
            return '#ffe1e7';
        case 'group':
            return '#ececec';
        default:
            return '#d9edff';
    }
};

const nodeTypes = {
    group: ZoneNode,
    default: EntityNode,
    output: DatastoreNode,
};

const Canvas: React.FC = () => {
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
                style:
                    type === 'group' ? { width: 300, height: 180 } :  // zone
                        type === 'output' ? { width: 100, height: 60 } :   // entity
                            type === 'default' ? { width: 100, height: 60 } : undefined,   // datastore
            };
            groupNodes(nodes, position, newNode);
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
                    nodeTypes={nodeTypes}
                >
                    <Controls />
                    <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
                </ReactFlow>
            </div>
            <Tooltip />
        </div>
    );
};

function groupNodes(nodes: Node[], position: XYPosition, newNode: Node) {
    const parentNode = nodes.find((node) =>
        node.type === 'group' &&
        position.x > node.position.x &&
        position.x < node.position.x + (node.style?.width as number || 0) &&
        position.y > node.position.y &&
        position.y < node.position.y + (node.style?.height as number || 0)
    );

    if (parentNode) {
        newNode.parentId = parentNode.id;
        newNode.extent = 'parent';

        // Adjust the position to be relative to the parent
        newNode.position = {
            x: position.x - parentNode.position.x,
            y: position.y - parentNode.position.y,
        };
    }
}

export default Canvas;