'use client'

import React from 'react';

import {useDnD} from "@/app/components/DnDContext";
import {LuDatabase, LuFrame, LuRectangleHorizontal} from "react-icons/lu";
import {AiOutlineFontColors} from "react-icons/ai";
import {GiGearStick} from "react-icons/gi";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

interface NodeInfo {
    type: 'group' | 'default' | 'output' | 'process' | 'text';
    dragLabel: string;
    icon: React.ReactNode;
}

const nodeTypes: NodeInfo[] = [
    { type: 'group', dragLabel: 'Zone', icon: <LuFrame /> },
    { type: 'default', dragLabel: 'Entity', icon: <LuRectangleHorizontal /> },
    { type: 'output', dragLabel: 'Datastore', icon: <LuDatabase /> },
    { type: 'process', dragLabel: 'Process', icon: <GiGearStick /> },
    { type: 'text', dragLabel: 'Text', icon: <AiOutlineFontColors /> },
];

const GeneralTools: React.FC = () => {
    const [, , setDnDState] = useDnD();

    const onDragStart = (event: React.DragEvent<HTMLButtonElement>, nodeInfo: NodeInfo) => {
        event.dataTransfer.setData('application/reactflow', nodeInfo.type);
        event.dataTransfer.effectAllowed = 'move';

        if (nodeInfo.type === 'text') {
            setDnDState([nodeInfo.type, { label: 'placeholder' }]);
        } else {
            setDnDState([nodeInfo.type, {model: undefined}]);
        }
    };

    return (
        <Card>
            {nodeTypes.map((nodeInfo) => (
                <Button
                    variant="ghost"
                    size="icon"
                    key={nodeInfo.type}
                    onDragStart={(event) => onDragStart(event, nodeInfo)}
                    draggable
                    title={nodeInfo.dragLabel}
                >
                    {nodeInfo.icon}
                </Button>
            ))}
        </Card>
    );
};

export default GeneralTools;