import {Element, elementSchema, buildElement } from '../element';
import { Additions } from "../additions";
import { Node } from './node';
import { UUID } from 'crypto';
import {typeOrObjectPattern} from "../symbol";

// DataStore Type
export type DataStore = Node & {
    metadata: {
        element: 'datastore';
    } & Element;
    authentication?: {
        credential?: {
            required?: boolean;
            strong?: boolean;
            expiration?: boolean;
        };
        antiAbuse?: boolean;
    }
}

export const datastoreSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['metadata'],
    properties: {
        metadata: elementSchema,
        tags: { type: 'array', items: { type: 'string' } },
        object: {
            type: 'string',
            pattern: typeOrObjectPattern
        },
        authentication: {
            type: 'object',
            additionalProperties: false,
            required: ['credential', 'antiAbuse'],
            properties: {
                credential: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['required', 'strong', 'expiration'],
                    properties: {
                        required: { type: 'boolean' },
                        strong: { type: 'boolean' },
                        expiration: { type: 'boolean' },
                    }
                },
                antiAbuse: { type: 'boolean' },
            }
        },
        additions: { $ref: '#/definitions/additionsSchema' }
    }
};

// Build DataStore
function buildDataStore(
    name: string,
    tags: string[] = [],
    object: string,
    required: boolean = false,
    strong: boolean = false,
    expiration: boolean = false,
    antiAbuse: boolean = false,
    id?: UUID | undefined,
    description?: string,
    icon?: string,
    additions?: Additions): DataStore {
    return {
        metadata: {
            ...buildElement(name, 'datastore', 'datastore', id, description, icon),
        },
        tags,
        object,
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

export function datastoreBuilder(item: any) {
    return buildDataStore(
        item.metadata.name,
        item.tags,
        item.object,
        item?.authentication?.credential.required,
        item?.authentication?.credential.strong,
        item?.authentication?.credential.expiration,
        item?.authentication?.antiAbuse,
        item.metadata.id,
        item.metadata.description,
        item.metadata.icon,
        item.additions
    );
}