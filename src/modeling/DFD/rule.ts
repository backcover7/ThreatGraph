import { UUID, generateUUID } from './base';
import { Element, ElementType } from './element';
import { Threat } from './threat';

// Rule Type
export type Rule = {
    id: UUID;
    threat: Threat;
    element: ElementType | Element;
    designs?: any;
    either?: any;
    design?: any;
}

export const ruleSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'threat', 'element' ],
    properties: {
        id: { type: 'string', format: 'uuid' },
        threat: { type: 'string', format: 'uuid' },
        element: { type: 'string', enum: [ 'zone', 'entity', 'datastore', 'process', 'dataflow' ] },
        designs: { type: 'array', items: { type: 'object' } },
        either: { type: 'array', items: { type: 'object' } },
        design: { type: 'string' },
    }
};

// Build Rule
function buildRule(
    threat: Threat,
    element: Element | ElementType,
    designs?: any,
    either?: any,
    design?: any,
    id?: UUID | undefined): Rule {
    return {
        id: id !== undefined ? id : generateUUID(),
        threat,
        element,
        designs,
        either,
        design
    };
}

export function ruleBuilder(item: any) {
    return buildRule(
        item.threat,
        item.element,
        item.designs,
        item.either,
        item.design,
        item.id
    );
}