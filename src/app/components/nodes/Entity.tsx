import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ElementToolbar } from "@/app/components/nodes/Element";
import { FaLaptop } from "react-icons/fa";

interface EntityNodeProps extends NodeProps {
    data: {
        label: string;
    };
    type: 'default';
}

// TODO https://reactflow.dev/learn/tutorials/mind-map-app-with-react-flow
const EntityNode: React.FC<EntityNodeProps> = ({ id, data, selected }) => {
    return (
        <ElementToolbar selected={selected} id={id}>
            {/*<div className="font-bold">{id}</div>*/}
            <FaLaptop style={{
                position: 'relative',
                top: 5,
                fontSize: 30
            }} />
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