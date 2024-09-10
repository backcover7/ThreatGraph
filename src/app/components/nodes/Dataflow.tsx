import React from 'react';
import {
    Edge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath, Handle, InternalNode,
    MarkerType, Position,
    useInternalNode,
    useReactFlow, XYPosition
} from '@xyflow/react';

export const defaultEdgeOptions = {
    type: 'process',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
    },
    animated: true,
    style: {
        strokeWidth: 1,
    },
};

const DataflowEdge: React.FC<EdgeProps<Edge<{ label: string }>>> = ({
                                                     id,
                                                     source,
                                                     target,
                                                     markerEnd,
                                                     style,
                                                     data,
                                                 }) => {
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = getEdgeParams(sourceNode, targetNode);

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetPosition,
        targetX,
        targetY,
    });

    return (
        <>
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                strokeWidth={5}
                markerEnd={markerEnd}
                style={style}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        background: '#cfe0ff',
                        padding: 5,
                        borderRadius: 10,
                        fontSize: 10,
                        fontWeight: 400,
                        opacity: 0.9,
                    }}
                    className="nodrag nopan"
                >
                    {data?.label}
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export const edgeTypes = {
    process: DataflowEdge,
};

function getParams(nodeA: InternalNode, nodeB: InternalNode): [number, number, Position] {
    const centerA = getNodeCenter(nodeA);
    const centerB = getNodeCenter(nodeB);

    const horizontalDiff = Math.abs(centerA.x - centerB.x);
    const verticalDiff = Math.abs(centerA.y - centerB.y);

    let position: Position;

    if (horizontalDiff > verticalDiff) {
        position = centerA.x > centerB.x ? Position.Left : Position.Right;
    } else {
        position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
    }

    const [x, y] = getHandleCoordsByPosition(nodeA, position);
    return [x, y, position];
}

function getHandleCoordsByPosition(node: InternalNode, handlePosition: Position): [number, number] {
    const handle = node.internals.handleBounds?.source?.find(
        (h) => h.position === handlePosition,
    ) || node.internals.handleBounds?.target?.find(
        (h) => h.position === handlePosition,
    );

    if (!handle) {
        // If no handle is found, use the node's center position
        return [
            node.internals.positionAbsolute!.x + (node.measured.width as number) / 2,
            node.internals.positionAbsolute!.y + (node.measured.height as number) / 2
        ];
    }

    let offsetX = handle.width / 2;
    let offsetY = handle.height / 2;

    switch (handlePosition) {
        case Position.Left:
            offsetX = 0;
            break;
        case Position.Right:
            offsetX = handle.width;
            break;
        case Position.Top:
            offsetY = 0;
            break;
        case Position.Bottom:
            offsetY = handle.height;
            break;
    }

    const x = node.internals.positionAbsolute!.x + handle.x + offsetX;
    const y = node.internals.positionAbsolute!.y + handle.y + offsetY;

    return [x, y];
}

function getNodeCenter(node: InternalNode): XYPosition {
    return {
        x: node.internals.positionAbsolute!.x + (node.measured.width as number) / 2,
        y: node.internals.positionAbsolute!.y + (node.measured.height as number) / 2,
    };
}

export function getEdgeParams(source: InternalNode, target: InternalNode): {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourcePosition: Position,
    targetPosition: Position,
} {
    const [sourceX, sourceY, sourcePosition] = getParams(source, target);
    const [targetX, targetY, targetPosition] = getParams(target, source);

    return {
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    };
}