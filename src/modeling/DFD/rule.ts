import { UUID, generateUUID } from "./base";
import { Element, ElementType } from './element';
import { Threat } from "./threat";

// Rule Type
export type Rule = {
    id: UUID;
    threat: Threat;
    element: ElementType | Element;
    analyze: any;
}

export const ruleSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'threat', 'element', 'analyze'],
    properties: {
        id: { type: 'string', format: 'uuid' },
        threat: { type: 'string', format: 'uuid' },
        element: { type: 'string', enum: [ 'zone', 'entity', 'datastore', 'process', 'dataflow' ] },
        analyze: { type: 'array', items: { type: 'object' } }
    }
};

// Build Rule
function buildRule(
    threat: Threat,
    element: Element | ElementType,
    analyze: any,
    id?: UUID | undefined): Rule {
    return {
        id: id !== undefined ? id : generateUUID(),
        threat,
        element,
        analyze
    };
}

export function ruleBuilder(item: any) {
    return buildRule(
        item.threat,
        item.element,
        item.analyze,
        item.id
    );
}