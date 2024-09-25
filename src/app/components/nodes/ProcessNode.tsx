'use client'

import React, { memo } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { ElementToolbar } from "@/app/components/nodes/ElementNode";
import { GiGearStick } from "react-icons/gi";
import { Process } from "@/DFD/process";
import IconRenderer from "@/app/components/IconRenderer";

interface ProcessNodeProps extends NodeProps {
    data: {
        model: Process;
    };
    type: 'process';
}

const ProcessNode: React.FC<ProcessNodeProps> = ({ id, data, selected }) => {
    return (
        <ElementToolbar selected={selected} id={id}>
            <NodeResizer
                color='#2561ff'
                isVisible={selected}
                minWidth={40}
                minHeight={10}
            />
            <div style={{
                position: 'relative',
                fontSize: 10
            }}>
                {data.model ? (
                    <IconRenderer dataUrl={data.model.metadata.icon} width={'30%'} height={'30%'} />
                ) : (
                    <GiGearStick style={{
                        position: 'relative',
                        top: 1,
                        fontSize: 12
                    }} />
                )}
                {data.model ? data.model.metadata.name : 'Process'}
            </div>
        </ElementToolbar>
    );
};

export default memo(ProcessNode);