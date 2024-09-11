'use client'

import React, {memo} from 'react';
import {Handle, NodeProps, NodeResizer, Position} from "@xyflow/react";
import { DiDatabase } from 'react-icons/di';
import { ElementToolbar } from "@/app/components/nodes/ElementNode";

interface DatastoreNodeProps extends NodeProps{
    data: {
        label: string;
    },
    type: 'output',
}

const DatastoreNode: React.FC<DatastoreNodeProps> = ({ id, data, selected }) => {
    return (
        <ElementToolbar selected={selected} id={id}>
            {/*<div className="font-bold">{id}</div>*/}
            <NodeResizer
                color='#2561ff'
                isVisible={selected}
                minWidth={100}
                minHeight={80}
            />
            <DiDatabase style={{  // TODO move all inline style to global.css
                position: 'relative',
                top: 1,
                fontSize: 24
            }} />
            <Handle type="target" position={Position.Top} id="datastore-top-target"/>
            <Handle type="target" position={Position.Right} id="datastore-right-target"/>
            <Handle type="target" position={Position.Bottom} id="datastore-botton-target"/>
            <Handle type="target" position={Position.Left} id="datastore-left-target"/>
        </ElementToolbar>
    );
};


export default memo(DatastoreNode);