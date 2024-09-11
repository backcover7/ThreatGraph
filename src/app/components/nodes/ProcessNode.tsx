import React, { memo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';

interface ProcessNodeProps extends NodeProps {
    data: {
        label: string;
    };
}

const ProcessNode: React.FC<ProcessNodeProps> = ({ data }) => {
    return (
        <div className="process-node" style={{ padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '5px' }}>
            <Handle type="target" position={Position.Top} />
            <div>{data.label}</div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default memo(ProcessNode);