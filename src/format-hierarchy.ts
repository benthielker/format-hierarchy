/**
 * Attempts to stringify value; embeds error in result instead of throwing.
 */
function tryStringify(
    arg1: unknown,
    arg2?: ((this: any, key: string, value: any) => any) | (number | string)[] | null,
    arg3?: string | number
): string {
    try {
        return JSON.stringify(arg1, arg2 as any, arg3);
    } catch (e: unknown) {
        return e instanceof Error ? e.message : String(e);
    }
}

/**
 * Configuration options for formatting object hierarchies.
 */
export interface FormatHierarchyOptions {
    /**
     * Target maximum line/column width in characters before wrapping lines or expanding nested structures.
     *
     * When specified:
     * - Compact representations of objects and arrays stay inline if they fit within `wrapAtWidth`
     *   (accounting for current indentation and property key length).
     * - Items in an array are packed onto lines and wrapped once adding another item exceeds `wrapAtWidth`.
     *
     * @default undefined (no width wrapping threshold; full multi-line expansion across all levels)
     *
     * @example 40 // Wrap lines and expand structures when exceeding 40 characters
     */
    wrapAtWidth?: number;
}

/**
 * Formats and stringifies an object hierarchy with compact line wrapping
 * based on a target width limit.
 *
 * @param obj The object, array, or primitive value to format
 * @param options Formatting configuration options (e.g. `{ wrapAtWidth: 40 }`)
 * @param currentDepth Internal recursion depth tracker (default: 0)
 * @param parentKeyPrefixLength Internal tracker for the current property key prefix length on the line
 * @param maxRecursionLimit Hard limit to prevent infinite recursion on circular or ultra-deep objects (default: 99)
 * @returns Formatted string representation, or `undefined` if `obj` is `undefined`
 *
 * @example
 * ```typescript
 * // Full multi-line format
 * formatHierarchy(data);
 *
 * // Compact wrapping at 40 characters width
 * formatHierarchy(data, { wrapAtWidth: 40 });
 * ```
 */
export function formatHierarchy(
    obj: any,
    options?: FormatHierarchyOptions,
    currentDepth: number = 0,
    parentKeyPrefixLength: number = 0,
    maxRecursionLimit: number = 99,
    visited: Set<unknown> = new Set(),
): string | undefined {
    if (obj === undefined) return undefined;

    // avoid circular reference via check for presence of obj in visited set.
    if (currentDepth >= maxRecursionLimit || (typeof obj === "object" && obj !== null && visited.has(obj))) {
        return tryStringify(obj);
    }

    const wrapAtWidth = options?.wrapAtWidth;
    const indentLength = currentDepth;
    const availableWidth = wrapAtWidth !== undefined
        ? Math.max(0, wrapAtWidth - indentLength - parentKeyPrefixLength)
        : undefined;

    // Check if the entire object fits on the current line within available width
    if (availableWidth !== undefined && typeof obj === "object" && obj !== null) {
        const stringified = tryStringify(obj);
        if (stringified.length <= availableWidth) {
            return stringified;
        }
    }
    if (obj && typeof obj === "object") {
        visited.add(obj);
        const nextDepth = currentDepth + 1;
        const indent = " ".repeat(currentDepth);
        const childIndent = " ".repeat(nextDepth);
        try {
            if (Array.isArray(obj)) {
                if (!obj.length) return "[]";
                let result = "[\n";
                let childRow = childIndent;
                for (let i = 0; i < obj.length; i++) {
                    const formattedChild = formatHierarchy(obj[i], options, nextDepth, 0, maxRecursionLimit, visited) ?? "null";
                    const isMultiLine = formattedChild.includes("\n");
                    const itemLength = formattedChild.length + 2; // ", "
                    // Check if row already has items (length > childIndent.length) without allocating trimmed strings
                    if (childRow.length > childIndent.length && (isMultiLine || (wrapAtWidth !== undefined && childRow.length + itemLength > wrapAtWidth))) {
                        result += `${childRow.slice(0, -1)}\n`; // strip trailing space before newline
                        childRow = childIndent;
                    }
                    childRow += `${formattedChild}, `;
                    if (isMultiLine) {
                        result += `${childRow.slice(0, -1)}\n`;
                        childRow = childIndent;
                    }
                }
                if (childRow.length > childIndent.length) {
                    result += `${childRow.slice(0, -1)}\n`;
                }
                result += `${indent}]`;
                return result;
            } else {
                const entries = Object.entries(obj);
                if (!entries.length) return "{}";
                let result = "{\n";
                let count = 0;
                for (let i = 0; i < entries.length; i++) {
                    const [k, child] = entries[i];
                    if (child === undefined) continue;
                    const keyPrefix = `${JSON.stringify(k)}:`;
                    const formattedChild = formatHierarchy(child, options, nextDepth, keyPrefix.length, maxRecursionLimit, visited);
                    if (formattedChild === undefined) continue;
                    result += `${childIndent}${keyPrefix}${formattedChild},\n`;
                    count++;
                }
                if (count === 0) return "{}";
                result += `${indent}}`;
                return result;
            }
        } finally {
            visited.delete(obj);
        }
    }
    return tryStringify(obj);
}
