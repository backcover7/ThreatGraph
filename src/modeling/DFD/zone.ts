import { UUID } from "./base";
import { Element, elementSchema, buildElement } from './element';
import { Entity } from "./node/entity";
import { DataStore } from "./node/datastore";

// Zone Type
export type Zone = {
    metadata: {
        element: 'zone';
    } & Element;
    tags?: string[];
    trust: 0 | 1 | 2 | 3 | 4 | 5;  // 0 is totally untrusted, 5 is totally trusted. If it is over 5 then this threat model is too huge.
    additions?: Record<string, unknown>;
}

export type ZoneAttached = {
    // Trust of parent zone <= current zone. If not, override trust of current zone with trust of parent zone.
    parent?: Zone;    // parent zone
    children?: Zone[];     // children zones
    entities?: Entity[];
    datastores?: DataStore[];
}

export const zoneSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['metadata', 'trust'],
    properties: {
        metadata: elementSchema,
        tags: { type: 'array', items: { type: 'string' } },
        trust: { type: 'number', enum: [0, 1, 2, 3, 4, 5] },
        additions: { $ref: '#/definitions/recursiveAdditions' }
    },
};

// Build Zone
function buildZone(
    name: string,
    type: string,
    trust: 0 | 1 | 2 | 3 | 4 | 5,
    tags: string[] = [],
    id?: UUID | undefined,
    description?: string,
    icon?: string,
    additions?: Record<string, unknown>): Zone {
    return {
        metadata: {
            ...buildElement(name, 'zone', type.toLowerCase(), id, description, icon),
        },
        tags,
        trust,
        additions
    };
}

export function zoneBuilder(item: any) {
    return buildZone(
        item.metadata.name,
        item.metadata.type,
        item.trust,
        item?.tags,
        item.metadata.id,
        item.metadata.description,
        item.metadata.icon,
        item?.additions
    );
}