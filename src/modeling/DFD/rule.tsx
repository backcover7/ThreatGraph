import { UUID, generateUUID } from "../DFD/base";
import { Element, ElementType } from '../DFD/element';
import { Threat } from "../DFD/threat";

// Rule Type
export type Rule = {
    id: UUID;
    threat: Threat;
    element: ElementType | Element;
    designs: any;
}

export const ruleSchema = {
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

// Build Rule
function buildRule(
    threat: Threat,
    element: Element | ElementType,
    designs: any,
    id?: UUID | undefined): Rule {
    return {
        id: id !== undefined ? id : generateUUID(),
        threat,
        element,
        designs
    };
}

export function ruleBuilder(item: any) {
    return buildRule(
        item.threat,
        item.element,
        item.designs,
        item.id
    );
}