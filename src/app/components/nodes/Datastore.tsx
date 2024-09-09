'use client'

import React, {memo} from 'react';
import {Handle, NodeProps, Position} from "@xyflow/react";
import { DiDatabase } from 'react-icons/di';
import { ElementToolbar } from "@/app/components/nodes/Element";

interface DatastoreNodeProps extends NodeProps{
    data: {
        label: string;
    },
    type: 'output',
}

const DatastoreNode: React.FC<DatastoreNodeProps> = ({ id, data, selected }) => {
    return (
        <ElementToolbar selected={selected}>
            <div className="font-bold">{id}</div>
            {/*<div className="font-bold"><DiDatabase/></div>*/}
            <Handle type="target" position={Position.Top} id="datastore-top-target"/>
            <Handle type="target" position={Position.Right} id="datastore-right-target"/>
            <Handle type="target" position={Position.Bottom} id="datastore-botton-target"/>
            <Handle type="target" position={Position.Left} id="datastore-left-target"/>
        </ElementToolbar>
    );
};


export default memo(DatastoreNode);