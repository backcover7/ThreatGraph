'use client'

import React, {memo} from 'react';
import {Handle, Position} from "@xyflow/react";

interface DatastoreNodeProps {
    data: {
        type: 'default',
        label: string;
    };
}

const DatastoreNode: React.FC<DatastoreNodeProps> = ({ data }) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
            <div className="font-bold">{data.label}</div>
            <Handle type="target" position={Position.Top} id="datastore-top-target" />
            <Handle type="target" position={Position.Right} id="datastore-right-target" />
            <Handle type="target" position={Position.Bottom} id="datastore-botton-target" />
            <Handle type="target" position={Position.Left} id="datastore-left-target" />
        </div>
    );
};


export default memo(DatastoreNode);