import React, {memo} from 'react';
import { Node, Edge } from '@xyflow/react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DataFlow } from "@/DFD/dataflow";
import { Zone } from "@/DFD/zone";
import { Entity } from "@/DFD/node/entity";
import { DataStore } from "@/DFD/node/datastore";
import { Process } from "@/DFD/process";

import {Separator} from "@/components/ui/separator";

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
            <Label className="text-gray-500">Select an element to view properties</Label>
        );
    }

    const selectedNode = nodes.find(node => node.id === lastSelectedElem);
    const selectedEdge = edges.find(edge => edge.id === lastSelectedElem);

    const renderCommonProperties = (item: Node | Edge) => (
        <>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <Label className="text-right font-bold">ID:</Label>
                <span className="col-span-2">{item.id}</span>
            </div>
            <Separator className="my-4" />
        </>
    );

    if (selectedNode) {
        const data = selectedNode.data as { model: Zone|Entity|DataStore|Process; element: 'zone'|'entity'|'datastore'|'process' };
        const model = data.model;
        const metadata = model?.metadata || { name: '', description: '', element: '' };
        const tags = model?.tags || [];

        return (
            <>
                {renderCommonProperties(selectedNode)}
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <Label className="text-right font-bold">Name:</Label>
                        <Input
                            value={metadata.name}
                            onChange={(e) => handleInputChange('metadata.name', e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Label className="text-right font-bold">Description:</Label>
                        <Input
                            value={metadata.description}
                            onChange={(e) => handleInputChange('metadata.description', e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Label className="text-right font-bold">Type:</Label>
                        <span className="col-span-2">{metadata.element}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Label className="text-right font-bold">Tags:</Label>
                        <div className="col-span-2 flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                    {selectedNode.type === 'group' && (
                        <div className="grid grid-cols-3 gap-4">
                            <Label className="text-right font-bold">Trust:</Label>
                            <Input
                                value={model && 'trust' in model ? (model as Zone).trust : ''}
                                onChange={(e) => handleInputChange('trust', e.target.value)}
                                className="col-span-2"
                            />
                        </div>
                    )}
                    {selectedNode.type === 'default' && (
                        <div className="grid grid-cols-3 gap-4">
                            <Label className="text-right font-bold">Object:</Label>
                            <Input
                                value={model && 'object' in model ? (model as Entity).object : ''}
                                onChange={(e) => handleInputChange('object', e.target.value)}
                                className="col-span-2"
                            />
                        </div>
                    )}
                    {selectedNode.type === 'output' && (
                        <div className="grid grid-cols-3 gap-4">
                            <Label className="text-right font-bold">Object:</Label>
                            <span className="col-span-2">datastore</span>
                        </div>
                    )}
                    {selectedNode.type === 'process' && (
                        <>
                            <div className="grid grid-cols-3 gap-4">
                                <Label className="text-right font-bold">Critical:</Label>
                                <Input
                                    value={model && 'attributes' in model ? (model as Process).attributes.critical : ''}
                                    onChange={(e) => handleInputChange('attributes.critical', e.target.value)}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4 items-center">
                                <Label className="text-right font-bold">CSRF Protected:</Label>
                                <Switch
                                    id="isCsrfProtected"
                                    checked={model && 'attributes' in model ? (model as Process).attributes.isCsrfProtected : false}
                                    onCheckedChange={(checked) => handleInputChange('attributes.isCsrfProtected', checked.toString())}
                                />
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    } else if (selectedEdge) {
        const edgeData = selectedEdge.data as { dataflow?: { model: DataFlow }, process?: { model: Process }, isProcessNode?: boolean };
        return (
            <>
                {renderCommonProperties(selectedEdge)}
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <Label className="text-right font-bold">Source:</Label>
                        <span className="col-span-2">{selectedEdge.source}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Label className="text-right font-bold">Target:</Label>
                        <span className="col-span-2">{selectedEdge.target}</span>
                    </div>
                    {edgeData.dataflow?.model && (
                        <div className="grid grid-cols-3 gap-4">
                            <Label className="text-right font-bold">Dataflow Name:</Label>
                            <Input
                                value={edgeData.dataflow.model.metadata.name}
                                onChange={(e) => handleInputChange('dataflow.model.metadata.name', e.target.value)}
                                className="col-span-2"
                            />
                        </div>
                    )}
                </div>
            </>
        );
    }

    return null;
};

export default memo(Properties);