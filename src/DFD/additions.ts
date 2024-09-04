/**
 *
 * JSON Schema for a YAML structure representing a set of questions
 *
 * This schema defines an object structure where each property represents a question:
 *
 * Key features:
 * - Root is an object with any number of properties (additionalProperties)
 * - Property names must follow a specific pattern:
 *   - Must start with a lowercase letter
 *   - Can only contain lowercase letters, numbers, and underscores
 *   - Pattern: ^[a-z][a-z0-9_]*$
 * - Each property is an object representing a question with the following structure:
 *   - Required:
 *     - question (string): The text of the question
 *     - type (string): The type of answer expected, can be 'string', 'boolean', or 'number'
 *   - Optional:
 *     - options (array): Required only when type is 'string'
 * - Options (when present):
 *   - An array of objects, each with:
 *     - value (string): The option value
 *     - description (string): A description of the option
 *
 * Example YAML structure this schema could validate:
 *
 * first_question:
 *   question: What is your favorite color?
 *   type: string
 *   options:
 *     - value: red
 *       description: The color of roses
 *     - value: blue
 *       description: The color of the sky
 * second_question:
 *   question: How old are you?
 *   type: number
 * third_question:
 *   question: Do you like ice cream?
 *   type: boolean
 *
 */

type OptionItem = {
    value: string;
    description: string;
};

type StringQuestion = {
    question: string;
    type: 'string';
    options: OptionItem[];
};

type BooleanQuestion = {
    question: string;
    type: 'boolean';
};

type NumberQuestion = {
    question: string;
    type: 'number';
};

type Question = StringQuestion | BooleanQuestion | NumberQuestion;

export type Additions = {
    [key: string]: Question;
};

export const additionsSchema = {
    type: 'object',
    propertyNames: {
        pattern: '^[a-z][a-z0-9_]*$'
    },
    additionalProperties: {
        oneOf: [
            {
                type: 'object',
                required: [ 'question', 'type' ],
                properties: {
                    question: { type: 'string' },
                    type: { type: 'string', enum: [ 'string', 'boolean', 'number' ] },
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
        ]
    }
};

export const additionsOptionsSchema = {
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

export function buildAdditions(additions: Additions): Record<string, Question> {
    const result: Record<string, Question> = {};

    for (const [key, item] of Object.entries(additions)) {
        switch (item.type) {
            case 'string':
                if (!Array.isArray(item.options) || item.options.length === 0) {
                    throw new Error(`String question "${key}" must have non-empty options array`);
                }
                result[key] = {
                    question: item.question,
                    type: item.type,
                    options: item.options
                };
                break;
            case 'boolean':
            case 'number':
                result[key] = {
                    question: item.question,
                    type: item.type
                };
                break;
            default:
                throw new Error(`Invalid question type for "${key}": ${(item as Question).type}`);
        }
    }

    return result;
}