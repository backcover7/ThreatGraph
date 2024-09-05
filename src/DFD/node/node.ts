import { Zone } from '../zone';
import { DataFlow } from '../dataflow';
import { Additions } from "../additions";

// Node Type: Entity Type and DataStore Type all extends from Node Type
export type Node = {
    tags?: string[];
    object: string;  // official name. metadata.name is customized name
    additions?: Additions;
}

export type NodeAttached = {
    zone: Zone;
    dataflows: DataFlow[];
}