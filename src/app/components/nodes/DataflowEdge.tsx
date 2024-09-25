import React, { useCallback } from 'react';
import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, getBezierPath, MarkerType, useReactFlow } from '@xyflow/react';
import { Process } from "@/DFD/process";
import {DataFlow, getDefaultDataFlow} from "@/DFD/dataflow";
import IconRenderer from "@/app/components/IconRenderer";
import {GiGearStick} from "react-icons/gi";

export type DataFlowEdgeData = {
    isProcessNode: boolean,
    dataflow: {
        model: DataFlow,
        element: 'dataflow';
    },
    process: {
        model: Process,
        element: 'process';
    }
}

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
    data: {
        isProcessNode: false,
        dataflow: {
            model: getDefaultDataFlow(),
        },
        process: {
            model: undefined,
        },
    },
};

const DataflowEdge: React.FC<EdgeProps<Edge<{dataflow?: {model: DataFlow}, process?: {model: Process}, isProcessNode?: boolean}>>> = ({
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

    const onAddProcess = useCallback(() => {
        setEdges(edges => (edges as Edge[]).map(edge =>
            edge.id === id ? { ...edge, data: { ...edge.data, isProcessNode: true } } : edge
        ) as never);
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
                    {data?.isProcessNode ?
                        <div style={{
                            position: 'relative',
                            fontSize: 10
                        }}>
                            {data.process?.model ? (
                                <IconRenderer dataUrl={data.process.model.metadata.icon} width={'30%'} height={'30%'}/>
                            ) : (
                                <GiGearStick style={{
                                    position: 'relative',
                                    top: 1,
                                    fontSize: 12
                                }}/>
                            )}
                            {data.process?.model ? data.process.model.metadata.name : 'Process'}
                        </div>
                        :
                        (<button className="edgebutton" onClick={onAddProcess}>+</button>)
                    }
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export const edgeTypes = {
    process: DataflowEdge,
};