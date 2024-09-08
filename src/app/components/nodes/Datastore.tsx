'use client'

import React, {memo} from 'react';
import { Handle, Position } from "@xyflow/react";
import { DiDatabase } from 'react-icons/di';
import { ElementToolbar } from "@/app/components/nodes/Element";

interface DatastoreNodeProps {
    data: {
        type: 'default',
        label: string;
    };
}

const DatastoreNode: React.FC<DatastoreNodeProps> = ({ data }) => {
    return (
        <ElementToolbar>
            <div className="font-bold"><DiDatabase /></div>
            <Handle type="target" position={Position.Top} id="datastore-top-target" />
            <Handle type="target" position={Position.Right} id="datastore-right-target" />
            <Handle type="target" position={Position.Bottom} id="datastore-botton-target" />
            <Handle type="target" position={Position.Left} id="datastore-left-target" />
        </ElementToolbar>
    );
};


export default memo(DatastoreNode);