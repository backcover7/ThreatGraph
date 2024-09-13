import { zoneSchema, zoneBuilder } from './zone';
import { entitySchema, entityBuilder } from './node/entity';
import { datastoreSchema, datastoreBuilder } from './node/datastore';
import { processSchema, processBuilder } from './process';
import { threatSchema, threatBuilder } from './threat';
import { ruleSchema, ruleBuilder } from './rule';
import { additionsSchema, additionsOptionsSchema } from "./additions";

export const moduleSchema = {
    type: 'object',
    required: ['module'],
    definitions: {
        additionsSchema: additionsSchema,
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

export function printRawSchema() {
    console.log(JSON.stringify(moduleSchema));
}

export {
    zoneBuilder, entityBuilder, datastoreBuilder, processBuilder, threatBuilder, ruleBuilder
}