import React, { useState, useCallback } from 'react';
import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, getBezierPath, MarkerType, useReactFlow } from '@xyflow/react';
import ProcessNode from "@/app/components/nodes/process/ProcessComponent";

export const defaultEdgeOptions = {
    type: 'process',
    zIndex: 1000,
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

const DataflowEdge: React.FC<EdgeProps<Edge<{ label: string, isProcessNode?: boolean }>>> = ({
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

    const { setEdges } = useReactFlow();
    const [showProcessNode, setShowProcessNode] = useState(data?.isProcessNode || false);

    const onAddProcess = useCallback(() => {
        setShowProcessNode(true);
        setEdges((eds) =>
            eds.map((ed) =>
                ed.id === id ? { ...ed, data: { ...ed.data, isProcessNode: true } } : ed
            )
        );
    }, [id, setEdges]);

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
                        zIndex: 1000
                    }}
                    className="nodrag nopan"
                >
                    {showProcessNode ? (
                        <ProcessNode data={{ label: 'P' }} />
                    ) : (
                        <button className="edgebutton" onClick={onAddProcess}>
                            +
                        </button>
                    )}
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export const edgeTypes = {
    process: DataflowEdge,
};