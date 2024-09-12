import React, { memo } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { ElementToolbar } from "@/app/components/nodes/ElementNode";
import {Process} from "@/DFD/process";
import {MdOutlinePrecisionManufacturing} from "react-icons/md";

export interface ProcessNodeProps extends NodeProps {
    data: {
        process: Process;
        isProcessNode: boolean;
    };
}

const ProcessNode: React.FC<ProcessNodeProps> = ({ id, data, selected }) => {
    return (
        <ElementToolbar selected={selected} id={id}>
            <NodeResizer
                color='#2561ff'
                isVisible={selected}
                minWidth={30}
                minHeight={20}
            />
            <div style={{
                background: '#ebebeb',
                fontSize: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
            }}>
                <div>
                    <MdOutlinePrecisionManufacturing />
                </div>
                <div>
                    {data ? data.process.metadata.name : 'Process'}
                </div>
            </div>
        </ElementToolbar>
    );
};

export default memo(ProcessNode);