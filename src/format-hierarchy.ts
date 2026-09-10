/**
 * Attempts to stringify value; embeds error in result instead of throwing.
 */
function tryStringify(
    arg1: unknown,
    arg2?: ((this: any, key: string, value: any) => any) | (number | string)[] | null,
    arg3?: string | number
): string {
    let stringified = "";
    try {
        stringified = JSON.stringify(arg1, arg2 as any, arg3);
    } catch (e: unknown) {
        if (e instanceof Error) {
            stringified = e.message;
        } else {
            stringified = String(e);
        }
    }
    return stringified;
}

/**
 * Original draft of function for posterity.
 * 
 * Stringifies given object with multi-line formatting up to given depth.
 *
 * Negative depth values are mode overrides...
 *   -1: no depth limit (full multi-line formatting)
 * < -1: multi-line format nodes whose stringified result is longer than this absolute value
 *       (ie: -200 will break up stringified objects longer than 200 characters)
 *
 * @param obj The object or value to format
 * @param formatDepth The maximum formatting depth or mode override (default: 1)
 * @param atDepth The current recursion depth (internal tracking)
 * @returns Formatted string representation of the object, or undefined if obj is undefined
 
export function formatHierarchyOld(
    obj: any,
    formatDepth?: number,
    atDepth?: number,
): string | undefined {
    if (obj === undefined) {
        return undefined;
    }
    let forcedFormatDepth: number | undefined;
    let stringified = "";
    if (formatDepth === -1) {
        // no depth limit; just do a pretty stringify of whole object.
        return tryStringify(obj, undefined, 2);
    } else if (formatDepth !== undefined && formatDepth < -1) {
        // dynamic depth based on length of stringified result
        stringified = tryStringify(obj);
        if ((stringified?.length || 0) < Math.abs(formatDepth)) {
            return stringified;
        } else {
            forcedFormatDepth = formatDepth;
        }
    }
    if (formatDepth === undefined) formatDepth = 1;
    let result = "";
    if (!atDepth || atDepth < 99) {
        if (formatDepth-- && obj && typeof obj === "object") {
            atDepth = (atDepth || 0) + 1;
            const indent = " ".repeat(atDepth * 2);
            const indentOuter = " ".repeat((atDepth - 1) * 2);
            if (obj instanceof Array) {
                if (!obj.length) {
                    result += "[]";
                } else {
                    result += `[\n`;
                    let childRow = `${indent}`;
                    for (let i = 0; i < obj.length; i++) {
                        const child = obj[i];
                        let formattedChild: string | undefined = "";
                        if (child !== undefined && child !== null) {
                            formattedChild = formatHierarchyOld(
                                child,
                                forcedFormatDepth ?? formatDepth,
                                atDepth,
                            );
                        } else if (child === null) {
                            formattedChild = tryStringify(child);
                        }

                        childRow += `${formattedChild}, `;
                        if (
                            i < obj.length - 1 &&
                            (formatDepth > -2 || childRow.length > Math.abs(formatDepth))
                        ) {
                            result += `${childRow}\n`;
                            childRow = `${indent}`;
                        }
                    }
                    result += `${childRow}\n`;
                    result += `${indentOuter}]`;
                }
            } else {
                if (!Object.keys(obj).length) {
                    result += "{}";
                } else {
                    result += `{\n`;
                    for (const k in obj) {
                        const child = obj[k];
                        if (child !== undefined && child !== null) {
                            result += `${indent}${JSON.stringify(
                                k
                            )}: ${formatHierarchyOld(
                                child,
                                forcedFormatDepth ?? formatDepth,
                                atDepth,
                            )},\n`;
                        } else if (child === null) {
                            result += `${indent}${JSON.stringify(k)}: ${tryStringify(
                                child
                            )},\n`;
                        }
                    }
                    result += `${indentOuter}}`;
                }
            }
        } else {
            result += tryStringify(obj);
        }
    } else {
        result = `ERROR: object too deep (${atDepth})`;
    }
    return result;
}*/


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
): string | undefined {
    if (obj === undefined) return undefined;

    if (currentDepth >= maxRecursionLimit) {
        return tryStringify(obj);
    }

    const wrapAtWidth = options?.wrapAtWidth;
    const indent = " ".repeat(currentDepth);
    const availableWidth = wrapAtWidth !== undefined
        ? Math.max(0, wrapAtWidth - indent.length - parentKeyPrefixLength)
        : undefined;

    // Check if the entire object fits on the current line within available width
    if (availableWidth !== undefined && typeof obj === "object" && obj !== null) {
        const stringified = tryStringify(obj);
        if (stringified.length <= availableWidth) {
            return stringified;
        }
    }

    if (obj && typeof obj === "object") {
        const nextDepth = currentDepth + 1;
        const childIndent = " ".repeat(nextDepth);

        if (Array.isArray(obj)) {
            if (!obj.length) return "[]";
            let result = "[\n";
            let childRow = `${childIndent}`;

            for (let i = 0; i < obj.length; i++) {
                const child = obj[i];
                const formattedChild = child === null
                    ? "null"
                    : formatHierarchy(child, options, nextDepth, 0, maxRecursionLimit) ?? "";

                const isMultiLine = formattedChild.includes("\n");
                const itemLength = formattedChild.length + 2; // ", "

                // If adding this item exceeds width, or if item is multi-line, wrap first
                if (childRow.trim().length > 0 && (isMultiLine || (wrapAtWidth !== undefined && childRow.length + itemLength > wrapAtWidth))) {
                    result += `${childRow.trimEnd()}\n`;
                    childRow = `${childIndent}`;
                }

                childRow += `${formattedChild}, `;

                if (isMultiLine) {
                    result += `${childRow.trimEnd()}\n`;
                    childRow = `${childIndent}`;
                }
            }

            if (childRow.trim().length > 0) {
                result += `${childRow.trimEnd()}\n`;
            }
            result += `${indent}]`;
            return result;
        } else {
            const keys = Object.keys(obj);
            if (!keys.length) return "{}";
            let result = "{\n";
            for (const k of keys) {
                const child = obj[k];
                const keyPrefix = `${JSON.stringify(k)}:`;
                const formattedChild = child === null
                    ? "null"
                    : formatHierarchy(child, options, nextDepth, keyPrefix.length, maxRecursionLimit);

                result += `${childIndent}${keyPrefix}${formattedChild},\n`;
            }
            result += `${indent}}`;
            return result;
        }
    }

    return tryStringify(obj);
}
