import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface EntityNodeProps {
    data: {
        label: string;
    };
}

const EntityNode: React.FC<EntityNodeProps> = ({ data }) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
            <div className="font-bold">{data.label}</div>
            <Handle type="target" position={Position.Top} id="entity-top-target" />
            <Handle type="source" position={Position.Top} id="entity-top-source" />
            <Handle type="target" position={Position.Right} id="entity-right-target" />
            <Handle type="source" position={Position.Right} id="entity-right-source" />
            <Handle type="target" position={Position.Bottom} id="entity-bottom-target" />
            <Handle type="source" position={Position.Bottom} id="entity-bottom-source" />
            <Handle type="target" position={Position.Left} id="entity-left-target" />
            <Handle type="source" position={Position.Left} id="entity-left-source" />
        </div>
    );
};

export default memo(EntityNode);