import { UUID } from 'crypto';

// Result Type
export type Result = {
    element: UUID;
    shape: string;
    rule: UUID;
    threat: UUID;
}