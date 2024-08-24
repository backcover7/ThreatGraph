import crypto from 'crypto';

declare const __brand: unique symbol;
export type UUID = string & { readonly [__brand]: 'UUID' };

export function generateUUID(): UUID { return crypto.randomUUID() as UUID; } // Could only use crypto.randomUUID() to generate UUID value

export const ModelElements = {
    ZONE: 'zone',
    ENTITY: 'entity',
    DATASTORE: 'datastore',
    PROCESS: 'process',
    DATAFLOW: 'dataflow'
}

export type ElementType = 'zone' | 'entity' | 'datastore' | 'process' | 'dataflow';

export type Element = {
    id: UUID;
    name: string;   // user customized name
    description?: string;
    icon?: string;
    element: ElementType;
    type: string;   // "public" zone, "client" entity, "mysql" datastore, 'http' protocol
    shape?: string;  // shape id shows on canvas
}

// Zone Type
export type Zone = {
    metadata: {
        element: 'zone';
    } & Element;
    groups?: string[];
    trust: 0 | 1 | 2 | 3;  // 0 is totally untrusted, 3 is totally trusted.
    additions?: Record<string, unknown>;
}

export type ZoneAttached = {
    // Trust of parent zone <= current zone. If not, override trust of current zone with trust of parent zone.
    parent?: Zone;    // parent zone
    children?: Zone[];     // children zones
    entities?: Entity[];
    datastores?: DataStore[];
}

// Node Type: Entity Type and DataStore Type all extends from Node Type
export type Node = {
    groups?: string[];
    additions?: Record<string, unknown>;
}

export type NodeAttached = {
    zone: Zone;
    flows: DataFlow[];
}

// Entity Type
export type Entity = Node & {
    metadata: {
        element: 'entity';
    } & Element;
    // The only property to identify the entity, like 'ftp', 'http'
    // if its metadata.type is server. it is ftp server. If type is client, it is ftp client.
    object: string;
}

// DataStore Type
export type DataStore = Node & {
    metadata: {
        element: 'datastore';
    } & Element;
    authentication: {
        credential: {
            required: boolean;
            strong: boolean;
            expiration: boolean;
        };
        antiAbuse: boolean;
    }
}

// Process Type
export type Process = {
    metadata: {
        element: 'process';
    } & Element;
    attributes: {
        critical: 0 | 1 | 2 | 3;   // 0 is totally uncritical, 3 is totally critical
        isSanitizer: boolean;
        isCsrfProtected: boolean;
        isAuthn: boolean;
        operation: 'r' | 'w' | 'rw';  // GET is read, POST is w, GET & POST is rw
    };
    calls?: string[];
    additions?: Record<string, unknown>;
}

export type ProcessAttached = {
    flow: DataFlow
}

// DataFlow Type
export type DataFlow = {
    metadata: {
        element: 'dataflow';
        type: 'http' | 'websocket' | 'ssh' | 'grpc' | 'mqtt' | 'dns' | 'rmi' | 'ftp' | any;
    } & Omit<Element, 'icon'>;  // Remove 'icon' from Element for DataFlow
    ssl: {
        isSSL: boolean;
        mTLS: boolean;
    }
    data?: {
        sensitive: 0 | 1 | 2 | 3;   // 0 is totally insensitive, 3 is totally sensitive
        content: 'normal' | 'secret' | 'PII' | 'credit card' | 'code' | any;
        format: 'text' | 'xml' | 'json' | 'binary' | any;
    };
    additions?: Record<string, unknown>;
}

export type DataflowAttached = {
    process: Process;   // TODO might support multi processes somehow
    active: Entity | DataStore;
    passive: Entity | DataStore;
}

// Threat Type
export type Threat = {
    id: UUID;
    name: string;
    severity: 'informative' | 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigation: string;
    references?: string[];
    compliance: {
        cwe: number[];
        owasp: string[];
        stride: ('Spoofing' | 'Tampering' | 'Repudiation' | 'Information disclosure' | 'Denial of service' | 'Elevation of privilege')[];
    };
    attached?: {
        entities?: Entity[];
        datastores?: DataStore[];
        processes?: Process[];
        dataflows?: DataFlow[];
    };
}

export type Rule = {
    id: UUID;
    threat: Threat;
    element: ElementType | Element;
    designs: any;
}

export type Result = {
    element: UUID;
    shape: string;
    rule: UUID;
    threat: UUID;
}

// Helper function to create Element
export function buildElement<T extends ElementType>(
    name: string,
    element: T,
    type: string,
    id?: UUID | undefined,
    shape?: string,
    description?: string,
    icon?: string): Element & { element: T } {
    return {
        id: id !== undefined ? id : generateUUID(),
        name,
        description,
        icon,
        element,
        type,
        shape,
    };
}

// Build Zone
export function buildZone(
    name: string,
    type: string,
    trust: 0 | 1 | 2 | 3,
    id?: UUID | undefined,
    shape?: string,
    description?: string,
    icon?: string,
    groups?: string[],
    additions?: Record<string, unknown>): Zone {
    return {
        metadata: {
            ...buildElement(name, 'zone', type, id, shape, description, icon),
        },
        groups,
        trust,
        additions
    };
}

// Build Entity
export function buildEntity(
    name: string,
    type: string,
    object: string,
    id?: UUID | undefined,
    shape?: string,
    description?: string,
    icon?: string,
    groups?: string[],
    additions?: Record<string, unknown>): Entity {
    return {
        metadata: {
            ...buildElement(name, 'entity', type, id, shape, description, icon),
        },
        groups,
        object,
        additions,
    };
}

// Build DataStore
export function buildDataStore(
    name: string,
    type: string,
    required: boolean = false,
    strong: boolean = false,
    expiration: boolean = false,
    antiAbuse: boolean = false,
    id?: UUID | undefined,
    shape?: string,
    description?: string,
    icon?: string,
    groups?: string[],
    additions?: Record<string, unknown>): DataStore {
    return {
        metadata: {
            ...buildElement(name, 'datastore', type, id, shape, description, icon),
        },
        groups,
        authentication: {
            credential: {
                required,
                strong,
                expiration,
            },
            antiAbuse,
        },
        additions,
    };
}

// Build Process
export function buildProcess(
    name: string,
    type: string,
    critical: 0 | 1 | 2 | 3,
    isSanitizer: boolean = false,
    isCsrfProtected: boolean = false,
    isAuthn: boolean = false,
    operation: 'r' | 'w' | 'rw',
    id?: UUID | undefined,
    shape?: string,
    description?: string,
    icon?: string,
    additions?: Record<string, unknown>): Process {
    return {
        metadata: {
            ...buildElement(name, 'process', type, id, shape, description, icon),
        },
        attributes: {
            critical,
            isSanitizer,
            isCsrfProtected,
            isAuthn,
            operation
        },
        additions,
        calls: [],
    };
}

export function buildDataFlow(
    name: string,
    type: 'http' | 'websocket' | 'ssh' | 'grpc' | 'mqtt' | 'dns' | 'rmi' | 'ftp' | any,
    isSSL: boolean = false,
    mTLS: boolean = false,
    sensitive: 0 | 1 | 2 | 3 = 0,
    content: 'normal' | 'secret' | 'PII' | 'credit card' | 'code' | any,
    format: 'text' | 'xml' | 'json' | 'binary' | any,
    id?: UUID | undefined,
    shape?: string,
    description?: string,
    additions?: Record<string, unknown>): DataFlow {
    return {
        metadata: {
            ...buildElement(name, 'dataflow', type, id, shape, description),
            type: type,
        },
        ssl: {
            isSSL,
            mTLS,
        },
        data: {
            sensitive,
            content,
            format
        },
        additions,
    };
}

// Build Threat
export function buildThreat(
    name: string,
    severity: 'informative' | 'low' | 'medium' | 'high' | 'critical',
    description: string,
    mitigation: string,
    stride: ('Spoofing' | 'Tampering' | 'Repudiation' | 'Information disclosure' | 'Denial of service' | 'Elevation of privilege')[],
    cwe: number[],
    owasp: string[],
    references: string[],
    id?: UUID | undefined): Threat {
    return {
        id: id !== undefined ? id : generateUUID(),
        name,
        severity,
        description,
        mitigation,
        references,
        compliance: {
            cwe,
            owasp,
            stride,
        }
    };
}

// Build Rule
export function buildRule(
    threat: Threat,
    element: Element | ElementType,
    designs: any,
    id?: UUID | undefined): Rule {
    return {
        id: id !== undefined ? id : generateUUID(),
        threat,
        element,
        designs
    };
}