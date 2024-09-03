// DataFlow Type
import { Element, buildElement } from './element';
import { Entity } from './node/entity';
import { DataStore } from './node/datastore';
import { Process } from './process';
import {UUID} from "crypto";

type protocol = 'http' | 'websocket' | 'ssh' | 'grpc' | 'mqtt' | 'dns' | 'rmi' | 'jndi' | 'ftp' | 'io' | any;

export type DataFlow = {
    metadata: {
        element: 'dataflow';
        type: protocol;
    } & Omit<Element, 'icon'>;  // Remove 'icon' from Element for DataFlow
    ssl: {
        isSSL: boolean;
        mTLS: boolean;
    };
    additions?: Record<string, unknown>;
}

export type DataflowAttached = {
    process: Process;   // TODO might support multi processes somehow
    source: Entity | DataStore;
    destination: Entity | DataStore;
}

export function buildDataFlow(
    name: string,
    type: protocol,
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