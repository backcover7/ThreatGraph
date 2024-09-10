import React from 'react';
import {BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, getBezierPath, MarkerType} from '@xyflow/react';

export const defaultEdgeOptions = {
    type: 'process',
    zIndex: 1000,  // Make sure edge is always on the top layer
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

const Dataflow: React.FC<EdgeProps<Edge<{ label: string }>>> = ({
                                                                    id,
                                                                    sourceX,
                                                                    sourceY,
                                                                    targetX,
                                                                    targetY,
                                                                    sourcePosition,
                                                                    targetPosition,
                                                                    style = {},
                                                                    markerEnd,
                                                                    data,
                                                                }) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BaseEdge id={id} className="react-flow__edge-path" path={edgePath} markerEnd={markerEnd} style={style} />
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
    process: Dataflow,
};