'use client'

import React from 'react';

import {useDnD} from "@/app/components/DnDContext";
import {LuDatabase, LuFrame, LuRectangleHorizontal} from "react-icons/lu";
import {AiOutlineFontColors} from "react-icons/ai";

interface NodeInfo {
    type: 'group' | 'default' | 'output' | 'process' | 'text';
    dragLabel: string;
    icon: React.ReactNode;
}

const nodeTypes: NodeInfo[] = [
    { type: 'group', dragLabel: 'Zone', icon: <LuFrame /> },
    { type: 'default', dragLabel: 'Entity', icon: <LuRectangleHorizontal /> },
    { type: 'output', dragLabel: 'Datastore', icon: <LuDatabase /> },
    // { type: 'process', dragLabel: 'Process', icon: <GiGearStick /> },
    { type: 'text', dragLabel: 'Text', icon: <AiOutlineFontColors /> },
];

const GeneralTools: React.FC = () => {
    const [, , setDnDState] = useDnD();

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeInfo: NodeInfo) => {
        event.dataTransfer.setData('application/reactflow', nodeInfo.type);
        event.dataTransfer.effectAllowed = 'move';

        if (nodeInfo.type === 'text') {
            setDnDState([nodeInfo.type, { label: 'placeholder' }]);
        } else {
            setDnDState([nodeInfo.type, {model: undefined}]);
        }
    };

    return (
        <div className="general-tools">
            {nodeTypes.map((nodeInfo) => (
                <div
                    key={nodeInfo.type}
                    className="dndnode"
                    onDragStart={(event) => onDragStart(event, nodeInfo)}
                    draggable
                    title={nodeInfo.dragLabel}
                >
                    {nodeInfo.icon}
                </div>
            ))}
        </div>
    );
};

export default GeneralTools;