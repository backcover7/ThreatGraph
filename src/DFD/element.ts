import { typeOrObjectPattern } from './base';
import { UUID, randomUUID } from 'crypto';

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
    type: string;   // 'public' zone, 'load-balancer' entity, 'mysql' datastore, 'http' protocol, this is the real thing it is.
    shape?: string;  // shape id shows on canvas
}

export const elementSchema = {
    type: 'object',
    additionalProperties: false,
    required: [ 'id', 'name', 'type' ],
    properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', maxLength: 20 },
        description: { type: 'string' },
        icon: { type: 'string', pattern: '^data:image/svg(\\+xml)?;base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$' },
        type: { type: 'string',  pattern: typeOrObjectPattern },
    },
};

// Helper function to create Element
export function buildElement<T extends ElementType>(
    name: string,
    element: T,
    type: string,
    id?: UUID | undefined,
    description?: string,
    icon?: string): Element & { element: T } {
    return {
        id: id !== undefined ? id : randomUUID(),
        name,
        description,
        icon,
        element,
        type,
    };
}