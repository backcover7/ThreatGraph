import { Node, Edge } from '@xyflow/react'
import {Zone, ZoneAttached} from "@/DFD/zone";
import {NodeAttached} from "@/DFD/node/node";
import {DataFlow, DataflowAttached} from "@/DFD/dataflow";
import {ProcessAttached} from "@/DFD/process";
import {Entity} from "@/DFD/node/entity";
import {DataStore} from "@/DFD/node/datastore";
import {DataFlowEdgeData} from "@/app/components/nodes/DataflowEdge";
import {elementTypes} from "@/DFD/element";

export default class Diagram {
    #nodes: Node[];
    #edges: Edge[];
    #processedElements: Array<any> = [];

    constructor(nodes: Node[], edges: Edge[]) {
        this.#nodes = nodes;
        this.#edges = edges;
    }

    process() {
        try {
            // zone, entity, datastore
            this.#nodes.forEach((node: Node) => {
                const model: any = node.data.model;
                model.metadata.shape = node.id;
                model.attached = (()=>{
                    switch (model.metadata.element) {
                        case elementTypes.ZONE:
                            return this.#buildZoneAttached(node);
                        case elementTypes.ENTITY:
                        case elementTypes.DATASTORE:
                            return this.#buildNodeAttached(node);
                        default:
                            return;
                    }
                })();
                this.#processedElements.push(model);
            });
            // dataflow, process
            this.#edges.forEach((edge: Edge) => {
                const edgeAttached = this.#buildDataflowAttached(edge);
                const dataflowModel = (edge.data as DataFlowEdgeData).dataflow?.model as any;
                dataflowModel.metadata.shape = edge.id;
                dataflowModel.attached = edgeAttached.dataflowAttached;

                const processModel = (edge.data as DataFlowEdgeData).process?.model as any;
                processModel.metadata.shape = edge.id;
                processModel.attached = edgeAttached.processAttached;

                this.#processedElements.push(dataflowModel, processModel);
            });

            return this.#processedElements;
        } catch (error) {
            console.error('Error processing diagram:', error);
            return [];
        }
    }

    #buildZoneAttached(zone: Node): ZoneAttached {
        return {
            parent: this.#nodes.find(parentZone => parentZone.id === zone.parentId)?.data.model as Zone,
            children: this.#nodes.filter(childZone => childZone.parentId === zone.id && (childZone.data.model as Zone).metadata.element === 'zone').map(childZone => childZone.data.model) as Zone[],
            entities: this.#nodes.filter(childEntity => childEntity.parentId === zone.id &&
                (childEntity.data.model as Entity).metadata.element === 'entity')
                .map(childEntity => childEntity.data.model) as Entity[],
            datastores: this.#nodes.filter(childDatastore => childDatastore.parentId === zone.id &&
                (childDatastore.data.model as DataStore).metadata.element === 'datastore')
                .map(childDatastore => childDatastore.data.model) as DataStore[],
        }
    }

    #buildNodeAttached(node: Node): NodeAttached {
        return {
            zone: this.#nodes.find(parentZone => parentZone.id === node.parentId)?.data.model as Zone,
            dataflows: this.#edges.filter(edge => edge.source === node.id || edge.target === node.id)
                .map(edge => (edge.data?.dataflow as {model: DataFlow}).model)
        }
    }

    #buildDataflowAttached(edge: Edge):
        {dataflowAttached: DataflowAttached, processAttached: ProcessAttached} {
        return {
            dataflowAttached: {
                process: (edge.data as DataFlowEdgeData).process.model,
                source: this.#nodes.find(node => node.id === edge.source)?.data.model as (Entity | DataStore),
                destination: this.#nodes.find(node => node.id === edge.target)?.data.model as (Entity | DataStore),
            },
            processAttached: {
                dataflow: (edge.data as DataFlowEdgeData).dataflow.model,
            }
        }
    }
}