import { zoneSchema, zoneBuilder } from './zone';
import { entitySchema, entityBuilder } from './node/entity';
import { datastoreSchema, datastoreBuilder } from './node/datastore';
import { processSchema, processBuilder } from './process';
import { threatSchema, threatBuilder } from './threat';
import { ruleSchema, ruleBuilder } from './rule';

export const typeOrObjectPattern = '^[a-z0-9]+(-[a-z0-9]+)*$'

/**
 * Define a recursive schema for additions property in element template
 *
 * This schema defines a recursive object structure where each property can be either:
 * 1. A leaf node with type, description, and optional options
 * 2. Another nested object following the same structure
 *
 * Key features:
 * - Root is an object with any number of properties (additionalProperties)
 * - Each property is either a leaf node or another nested object
 * - Leaf nodes:
 *   - Required: type (string, boolean, or number) and description
 *   - Optional: options (only allowed and required for string type)
 * - Options:
 *   - An array of objects, each with a value and description
 * - Recursive: Nested objects follow the same structure as the root
 *
 * Example YAML structure this schema could validate:
 *
 * root_property:
 *   nested_object:
 *     string_prop:
 *       type: string
 *       description: A string property
 *       options:
 *         - value: option1
 *           description: First option
 *         - value: option2
 *           description: Second option
 *     boolean_prop:
 *       type: boolean
 *       description: A boolean property
 *   number_prop:
 *     type: number
 *     description: A number property
 */
const recursiveAdditionsSchema = {
    type: 'object',
    additionalProperties: {
        oneOf: [
            {
                type: 'object',
                required: [ 'type', 'description' ],
                properties: {
                    type: { type: 'string', enum: [ 'string', 'boolean', 'number' ] },
                    description: { type: 'string' },
                    options: { $ref: '#/definitions/additionsOptionsSchema' }
                },
                allOf: [
                    {
                        if: { properties: { type: { const: 'string' }}},
                        then: {
                            required: ['options'],
                            properties: { options: { $ref: '#/definitions/additionsOptionsSchema' }}
                        },
                        else: { not: { required: ['options'] }}
                    }
                ],
                additionalProperties: false
            },
            { $ref: '#/definitions/recursiveAdditions' }
        ]
    }
};

const additionsOptionsSchema = {
    type: 'array',
    items: {
        type: 'object',
        required: ['value', 'description'],
        properties: {
            value: { type: 'string' },
            description: { type: 'string' }
        },
        additionalProperties: false
    }
}

export const moduleSchema = {
    type: 'object',
    required: ['module'],
    definitions: {
        recursiveAdditions: recursiveAdditionsSchema,
        additionsOptionsSchema: additionsOptionsSchema
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