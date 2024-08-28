// This is schema for json schema for all yaml templates.

const typeOrObjectPattern = '^[a-z0-9]+(-[a-z0-9]+)*$'

const elementSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name', 'type'],
    properties: {
        id: {  type: 'string', format: 'uuid' },
        name: {
            type: 'string',
            maxLength: 20
        },
        description: { type: 'string' },
        icon: {
            type: 'string',
            pattern: '^data:image/svg(\\+xml)?;base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
        },
        type: {
            type: 'string',
            pattern: typeOrObjectPattern
        },
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
        tags: { type: 'array', items: { type: 'string' } },
        trust: { type: 'number', enum: [0, 1, 2, 3] },
        additions: { $ref: '#/definitions/recursiveAdditions' }
    },
};

const entitySchema = {
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

const datastoreSchema = {
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
        additions: { $ref: '#/definitions/recursiveAdditions' }
    }
};

const processSchema = {
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
                    type: 'string',
                    anyOf: [
                        { enum: ['normal', 'secret', 'PII', 'credit card', 'code'] },
                        { type: 'string' }
                    ]
                },
                format: {
                    type: 'string',
                    anyof: [
                        { enum: ['text', 'xml', 'json', 'binary' ]  },
                        { type: 'string' }
                    ]
                },
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
                entity: { type: 'array', items: entitySchema },
                datastore: { type: 'array', items: datastoreSchema },
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