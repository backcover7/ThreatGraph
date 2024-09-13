'use client'

import React, { useState, useCallback } from 'react';
import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, getBezierPath, MarkerType, useReactFlow, NodeProps } from '@xyflow/react';
import ProcessNode, { ProcessNodeProps } from "@/app/components/nodes/ProcessNode";
import { Process } from "@/DFD/process";
import {MdOutlinePrecisionManufacturing} from "react-icons/md";

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

const DataflowEdge: React.FC<EdgeProps<Edge<{ process?: Process, isProcessNode?: boolean }>>> = ({
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
        // You might want to trigger some application logic here to handle the actual process creation
        // For example: triggerProcessCreation(id);
    }, [id, setEdges]);

    // Default props for ProcessNode when used in an edge
    const defaultProcessNodeProps: Omit<ProcessNodeProps, 'data'> = {
        id: `${id}`,
        type: 'process',
        zIndex: 2000,
        dragging: false,
        isConnectable: false,
        selected: false,
        positionAbsoluteX: 0,
        positionAbsoluteY: 0,
    };

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
                    {showProcessNode || data?.isProcessNode ? (
                        data?.process ? (
                            <ProcessNode
                                {...defaultProcessNodeProps}
                                data={{
                                    process: data.process,
                                    isProcessNode: true
                                }}
                            />
                        ) : (
                            <div style={{
                                background: '#ebebeb',
                                fontSize: '8px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                            }}>
                                <div>
                                    <MdOutlinePrecisionManufacturing/>
                                </div>
                                <div>
                                    {'Process'}
                                </div>
                            </div>
                        )
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