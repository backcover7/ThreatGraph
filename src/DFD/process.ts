import { Element, elementSchema, buildElement } from './element';
import { DataFlow } from './dataflow';
import { Additions } from "./additions";
import { UUID } from 'crypto';

// Process Type
export type Process = {
    metadata: {
        element: 'process';
    } & Element;
    tags?: string[];
    attributes: {
        critical: 0 | 1 | 2 | 3;   // 0 is totally uncritical, 3 is totally critical
        isCsrfProtected: boolean;
        operation: 'r' | 'w' | 'rw';  // GET is read, POST is w, GET & POST is rw
    };
    data: {
        sensitive: 0 | 1 | 2 | 3;   // 0 is totally insensitive, 3 is totally sensitive
        content: 'normal' | 'secret' | 'PII' | 'credit card' | 'code' | 'customer data' | any;
        format: 'text' | 'xml' | 'json' | 'binary' | any;
    };
    calls?: string[];
    additions?: Additions;
}

export type ProcessAttached = {
    dataflow: DataFlow
}

export const processSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['metadata', 'attributes'],
    properties: {
        metadata: elementSchema,
        tags: { type: 'array', items: { type: 'string' } },
        attributes: {
            type: 'object',
            additionalProperties: false,
            required: ['critical', 'operation'],
            properties: {
                critical: { type: 'number', enum: [0, 1, 2, 3] },
                isCsrfProtected: { type: 'boolean' },
                operation: { type: 'string', enum: ['r', 'w', 'rw'] },
            },
        },
        data: {
            type: 'object',
            additionalProperties: false,
            required: ['sensitive', 'content', 'format'],
            properties: {
                sensitive: { type: 'number', enum: [0, 1, 2, 3] },
                content: {
                    type: 'string', enum: [ 'normal', 'secret', 'PII', 'credit card', 'code', 'customer data']
                },
                format: {
                    type: 'string', enum: [ 'text', 'xml', 'json', 'binary' ]
                },
            },
        },
        calls: { type: 'array', items: { type: 'string' } },
        additions: { $ref: '#/definitions/additionsSchema' }
    },
};

// Build Process
function buildProcess(
    name: string,
    type: string,
    tags: string[] = [],
    critical: 0 | 1 | 2 | 3,
    isCsrfProtected: boolean = false,
    operation: 'r' | 'w' | 'rw',
    sensitive: 0 | 1 | 2 | 3,
    content: 'normal' | 'secret' | 'PII' | 'credit card' | 'code' | 'customer data' | any,
    format: 'text' | 'xml' | 'json' | 'binary' | any,
    id?: UUID | undefined,
    description?: string,
    icon?: string,
    additions?: Additions): Process {
    return {
        metadata: {
            ...buildElement(name, 'process', type, id, description, icon),
        },
        tags,
        attributes: {
            critical,
            isCsrfProtected,
            operation
        },
        data: {
            sensitive,
            content,
            format
        },
        additions,
        calls: [],
    };
}

export function processBuilder(item: any) {
    return buildProcess(
        item.metadata.name,
        item.metadata.type,
        item.tags,
        item.attributes.critical,
        item.attributes?.isCsrfProtected,
        item.attributes.operation,
        item.data?.sensitive,
        item.data?.content,
        item.data?.format,
        item.metadata.id,
        item.metadata.description,
        item.metadata.icon,
        item.additions
    );
}