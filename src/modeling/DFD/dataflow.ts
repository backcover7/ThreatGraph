// DataFlow Type
import { UUID } from "./base";
import { Element, buildElement } from './element';
import { Entity } from "./node/entity";
import { DataStore } from "./node/datastore";
import { Process } from "./process";

export type DataFlow = {
    metadata: {
        element: 'dataflow';
        type: 'http' | 'websocket' | 'ssh' | 'grpc' | 'mqtt' | 'dns' | 'rmi' | 'ftp' | 'io' | any;
    } & Omit<Element, 'icon'>;  // Remove 'icon' from Element for DataFlow
    ssl: {
        isSSL: boolean;
        mTLS: boolean;
    };
    additions?: Record<string, unknown>;
}

export type DataflowAttached = {
    process: Process;   // TODO might support multi processes somehow
    active: Entity | DataStore;
    passive: Entity | DataStore;
}

export function buildDataFlow(
    name: string,
    type: 'http' | 'websocket' | 'ssh' | 'grpc' | 'mqtt' | 'dns' | 'rmi' | 'ftp' | 'io' | any,
    isSSL: boolean = false,
    mTLS: boolean = false,
    id?: UUID | undefined,
    description?: string,
    additions?: Record<string, unknown>): DataFlow {
    return {
        metadata: {
            ...buildElement(name, 'dataflow', type, id, description),
            type: type,
        },
        ssl: {
            isSSL,
            mTLS,
        },
        additions,
    };
}