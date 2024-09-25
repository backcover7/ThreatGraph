'use client'

import React, {memo} from 'react';
import {Handle, NodeProps, NodeResizer, Position} from "@xyflow/react";
import { DiDatabase } from 'react-icons/di';
import { ElementToolbar } from "@/app/components/nodes/ElementNode";
import {DataStore} from "@/DFD/node/datastore";
import IconRenderer from "@/app/components/IconRenderer";

interface DatastoreNodeProps extends NodeProps{
    data: {
        model: DataStore;
    };
    type: 'output';
}

const DatastoreNode: React.FC<DatastoreNodeProps> = ({ id, data, selected }) => {
    return (
        <ElementToolbar selected={selected} id={id}>
            <NodeResizer
                color='#2561ff'
                isVisible={selected}
                minWidth={30}
                minHeight={20}
            />
            {data.model ? (
                <IconRenderer dataUrl={data.model.metadata.icon} width={'30%'} height={'30%'} />
            ) : (
                <DiDatabase style={{  // TODO move all inline style to global.css
                    position: 'relative',
                    top: 1,
                    fontSize: 24
                }} />
            )}
            <div>
                {data.model ? data.model.metadata.name : 'Datastore'}
            </div>
            <Handle type="target" position={Position.Top} id="datastore-top-target"/>
            <Handle type="target" position={Position.Right} id="datastore-right-target"/>
            <Handle type="target" position={Position.Bottom} id="datastore-botton-target"/>
            <Handle type="target" position={Position.Left} id="datastore-left-target"/>
        </ElementToolbar>
    );
};


export default memo(DatastoreNode);