import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { ElementToolbar } from "@/app/components/nodes/Element";

interface EntityNodeProps {
    data: {
        label: string;
    },
    type: 'default';
}

const EntityNode: React.FC<EntityNodeProps> = ({ data }) => {
    return (
        <ElementToolbar>
            <div className="font-bold">{data.label}</div>
            <Handle type="target" position={Position.Top} id="entity-top-target"/>
            <Handle type="source" position={Position.Top} id="entity-top-source"/>
            <Handle type="target" position={Position.Right} id="entity-right-target"/>
            <Handle type="source" position={Position.Right} id="entity-right-source"/>
            <Handle type="target" position={Position.Bottom} id="entity-bottom-target"/>
            <Handle type="source" position={Position.Bottom} id="entity-bottom-source"/>
            <Handle type="target" position={Position.Left} id="entity-left-target"/>
            <Handle type="source" position={Position.Left} id="entity-left-source"/>
        </ElementToolbar>
    );
};

export default memo(EntityNode);