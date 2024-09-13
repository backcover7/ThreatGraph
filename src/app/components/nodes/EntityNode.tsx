'use client'

import React, { memo } from 'react';
import {Handle, Position, NodeProps, NodeResizer} from '@xyflow/react';
import { ElementToolbar } from "@/app/components/nodes/ElementNode";
import { FaLaptop } from "react-icons/fa";
import {Entity} from "@/DFD/node/entity";

interface EntityNodeProps extends NodeProps {
    data: {
        model: Entity;
    };
    type: 'default';
}

// TODO https://reactflow.dev/learn/tutorials/mind-map-app-with-react-flow
const EntityNode: React.FC<EntityNodeProps> = ({ id, data, selected }) => {
    return (
        <ElementToolbar selected={selected} id={id}>
            <NodeResizer
                color='#2561ff'
                isVisible={selected}
                minWidth={30}
                minHeight={20}
            />
            <FaLaptop style={{
                position: 'relative',
                top: 1,
                fontSize: 24
            }} />
            <div>
                {data.model ? data.model.metadata.name : 'Entity'}
            </div>
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