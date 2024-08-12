// Create a new schema that includes custom types
const elementSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name', 'type'],
    properties: {
        id: {  type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string' },
        icon: { type: 'string' },
        type: { type: 'string' },
    },
};

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

const zoneSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['metadata', 'trust'],
    properties: {
        metadata: elementSchema,
        groups: { type: 'array', items: { type: 'string' } },
        trust: { type: 'number', enum: [0, 1, 2, 3] },
        additions: { $ref: '#/definitions/recursiveAdditions' }
    },
};

// Entity schema is as same as Datastore schema
const nodeSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['metadata', 'object'],
    properties: {
        metadata: elementSchema,
        groups: { type: 'array', items: { type: 'string' } },
        object: { type: 'string' },
        additions: { $ref: '#/definitions/recursiveAdditions' }
    }
};

const processSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['metadata', 'attributes'],
    properties: {
        metadata: elementSchema,
        groups: { type: 'array', items: { type: 'string' } },
        attributes: {
            type: 'object',
            additionalProperties: false,
            required: ['critical', 'isSanitizer', 'isAuthn', 'operation'],
            properties: {
                critical: { type: 'number', enum: [0, 1, 2, 3] },
                isSanitizer: { type: 'boolean' },
                isAuthn: { type: 'boolean' },
                operation: { type: 'string', enum: ['r', 'w', 'rw'] },
            },
        },
        calls: { type: 'array', items: { type: 'string' } },
        additions: { $ref: '#/definitions/recursiveAdditions' }
    },
};

const threatSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name', 'severity', 'description', 'mitigation', 'compliance'],
    properties: {
        id: {  type: 'string', format: 'uuid' },
        name: { type: 'string' },
        severity: { type: 'string', enum: ['informative', 'low', 'medium', 'high', 'critical'] },
        description: { type: 'string' },
        mitigation: { type: 'string' },
        references: { type: 'array', items: { type: 'string' } },
        compliance: {
            type: 'object',
            additionalProperties: false,
            required: ['cwe', 'owasp', 'stride'],
            properties: {
                cwe: { type: 'array', items: { type: 'string' } },
                owasp: { type: 'array', items: { type: 'string' } },
                stride: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege']
                    }
                },
            },
        },
    },
};

const ruleSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'threat', 'element', 'designs'],
    properties: {
        id: { type: 'string', format: 'uuid' },
        threat: { type: 'string', format: 'uuid' },
        element: {
            type: 'object',
            additionalProperties: false,
            required: ['type'],
            properties: {
                type: { type: 'string' },
                id: { type: 'string', format: 'uuid' }
            }
        },
        designs: { type: 'array', items: { type: 'object' } }
    }
};

const moduleSchema = {
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
                entity: { type: 'array', items: nodeSchema },
                datastore: { type: 'array', items: nodeSchema },
                process: { type: 'array', items: processSchema },
                threat: { type: 'array', items: threatSchema },
                rule: { type: 'array', items: ruleSchema },
            }
        },
    }
};

export default {
    moduleSchema
}