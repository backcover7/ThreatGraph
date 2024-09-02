import { zoneSchema, zoneBuilder } from './zone';
import { entitySchema, entityBuilder } from './node/entity';
import { datastoreSchema, datastoreBuilder } from './node/datastore';
import { processSchema, processBuilder } from './process';
import { threatSchema, threatBuilder } from './threat';
import { ruleSchema, ruleBuilder } from './rule';

export const typeOrObjectPattern = '^[a-z0-9]+(-[a-z0-9]+)*$'

// Define a recursive schema for additions
const recursiveAdditionsSchema = {
    type: 'object',
    additionalProperties: {
        oneOf: [
            {
                type: 'object',
                required: ['type', 'description'],
                properties: {
                    type: { type: 'string' },
                    description: { type: 'string' }
                },
                additionalProperties: false
            },
            { $ref: '#/definitions/recursiveAdditions' }
        ]
    }
};

export const moduleSchema = {
    type: 'object',
    required: ['module'],
    definitions: {
        recursiveAdditions: recursiveAdditionsSchema
    },
    properties: {
        module: {
            type: 'object',
            properties: {
                zone: { type: 'array', items: zoneSchema },
                entity: { type: 'array', items: entitySchema },
                datastore: { type: 'array', items: datastoreSchema },
                process: { type: 'array', items: processSchema },
                threat: { type: 'array', items: threatSchema },
                rule: { type: 'array', items: ruleSchema },
            }
        },
    }
};

export {
    zoneBuilder, entityBuilder, datastoreBuilder, processBuilder, threatBuilder, ruleBuilder
}