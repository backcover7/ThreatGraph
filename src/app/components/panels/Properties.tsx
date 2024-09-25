import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DataFlow } from "@/DFD/dataflow";
import {Zone} from "@/DFD/zone";
import {Entity} from "@/DFD/node/entity";
import {DataStore} from "@/DFD/node/datastore";
import {Process} from "@/DFD/process";

interface PropertiesPanelProps {
    lastSelectedElem: string | undefined;
    nodes: Node[];
    edges: Edge[];
}

const Properties: React.FC<PropertiesPanelProps> = ({ lastSelectedElem, nodes, edges }) => {
    const handleInputChange = (field: string, value: string) => {
        // Implement the logic for handling input changes
    };

    if (!lastSelectedElem) {
        return (
            <Label className="flex items-center justify-center text-gray-500">
                Select one element
            </Label>
        );
    }

    const selectedNode = nodes.find(node => node.id === lastSelectedElem);
    const selectedEdge = edges.find(edge => edge.id === lastSelectedElem);

    if (selectedNode) {
        const data = selectedNode.data as { model: Zone|Entity|DataStore|Process; element: 'zone'|'entity'|'datastore'|'process' };
        const model = data.model;

        const metadata = model?.metadata || { name: '', description: '', element: '' };
        const tags = model?.tags || [];

        return (
            <>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">ID</Label>
                    <Label className="text-center">{selectedNode.id}</Label>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Name</Label>
                    <Input
                        id="name"
                        value={metadata.name}
                        onChange={(e) => handleInputChange('metadata.name', e.target.value)}
                        className="col-span-2"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Description</Label>
                    <Input
                        id="description"
                        value={metadata.description}
                        onChange={(e) => handleInputChange('metadata.description', e.target.value)}
                        className="col-span-2"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Type</Label>
                    <Label className="text-center">{metadata.element}</Label>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Tags</Label>
                    <div className="col-span-3 flex items-center space-x-2 overflow-x-auto">
                        {tags.map((tag, index) => (
                            <Badge key={index}>{tag}</Badge>
                        ))}
                    </div>
                </div>
                {selectedNode.type === 'group' &&
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Trust</Label>
                        <Input id="trust" value={model && 'trust' in model ? (model as Zone).trust : ''} className="text-center col-span-3"/>
                    </div>
                }
                {selectedNode.type === 'default' &&
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Object</Label>
                        <Input
                            id="object"
                            value={model && 'object' in model ? (model as Entity).object : ''}
                            onChange={(e) => handleInputChange('object', e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                }
                {selectedNode.type === 'output' &&
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Object</Label>
                        <Label className="text-center col-span-3">datastore</Label>
                    </div>
                }
                {selectedNode.type === 'process' &&
                    <>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Critical</Label>
                            <Input
                                id="critical"
                                value={model && 'attributes' in model ? (model as Process).attributes.critical : ''}
                                onChange={(e) => handleInputChange('attributes.critical', e.target.value)}
                                className="text-center col-span-3"/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Switch id="isCsrfProtected"/>
                            <Label className="text-right">isCsrfProtected</Label>
                        </div>
                    </>
                }
            </>
        );
    } else if (selectedEdge) {
        const edgeData = selectedEdge.data as { dataflow?: { model: DataFlow }, process?: { model: Process }, isProcessNode?: boolean };
        return (
            <>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">ID</Label>
                    <Label className="text-center">{selectedEdge.id}</Label>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Source</Label>
                    <Label className="text-center">{selectedEdge.source}</Label>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Target</Label>
                    <Label className="text-center">{selectedEdge.target}</Label>
                </div>
                {edgeData.dataflow?.model && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Dataflow Name</Label>
                        <Input
                            value={edgeData.dataflow.model.metadata.name}
                            onChange={(e) => handleInputChange('dataflow.model.metadata.name', e.target.value)}
                            className="text-center col-span-3"
                        />
                    </div>
                )}
            </>
        );
    }

    return null;
};

export default Properties;