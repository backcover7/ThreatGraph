export default {
    safeMap,
    safeGet
}

function safeMap<T, U>(arr: T[] | undefined, fn: (item: T) => U): U[] {
    return Array.isArray(arr) ? arr.map(fn) : [];
}

function safeGet(obj: any, path: string, defaultValue: any = undefined): any {
    return path.split('.').reduce((acc, part) =>
        (acc && acc[part] !== undefined) ? acc[part] : defaultValue, obj);
}