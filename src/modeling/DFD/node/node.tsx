import { Zone } from "../../DFD/zone";
import { DataFlow } from "../../DFD/dataflow";

// Node Type: Entity Type and DataStore Type all extends from Node Type
export type Node = {
    tags?: string[];
    object: string;  // official name. metadata.name is customized name
    additions?: Record<string, unknown>;
}

export type NodeAttached = {
    zone: Zone;
    flows: DataFlow[];
}