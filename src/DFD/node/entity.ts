// Entity Type
import { typeOrObjectPattern } from '../base';
import { Element, elementSchema, buildElement } from '../element';
import { Node } from './node';
import {UUID} from "crypto";

export type Entity = Node & {
    metadata: {
        element: 'entity';
    } & Element;
}

export const entitySchema = {
    type: 'object',
    additionalProperties: false,
    required: ['metadata', 'object'],
    properties: {
        metadata: elementSchema,
        tags: { type: 'array', items: { type: 'string' } },
        object: {
            type: 'string',
            pattern: typeOrObjectPattern
        },
        additions: { $ref: '#/definitions/recursiveAdditions' }
    }
};

// Build Entity
function buildEntity(
    name: string,
    type: string,
    tags: string[] = [],
    object: string,
    id?: UUID | undefined,
    description?: string,
    icon?: string,
    additions?: Record<string, unknown>): Entity {
    return {
        metadata: {
            ...buildElement(name, 'entity', type, id, description, icon),
        },
        tags,
        object,
        additions,
    };
}

export function entityBuilder(item: any) {
    return buildEntity(
        item.metadata.name,
        item.metadata.type,
        item?.tags,
        item.object,
        item.metadata.id,
        item.metadata.description,
        item.metadata.icon,
        item?.additions
    );
}