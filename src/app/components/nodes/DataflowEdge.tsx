import React from 'react';
import {BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, getBezierPath, MarkerType} from '@xyflow/react';

export const defaultEdgeOptions = {
    type: 'process',
    zIndex: 1000,  // Make sure edge is always on the top layer but lower than EdgeLabelRender zIndex
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

    const onProcessAdding = () => {

    }

    return (
        <>
            <BaseEdge id={id} className="react-flow__edge-path" path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                        fontSize: 10,
                        zIndex: 2000  // Edge zIndex is 1000, process should be over Edge zIndex
                    }}
                    className="nodrag nopan"
                >
                    <button className="edgebutton" onClick={onProcessAdding}>
                        +
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export const edgeTypes = {
    process: DataflowEdge,
};