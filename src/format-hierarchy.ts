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
 */
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
}


/**
 * Configuration options for formatting object hierarchies.
 */
export interface FormatHierarchyOptions {
    /**
     * Maximum recursion depth to expand into multi-line formatting.
     * Nodes beyond this depth are serialized compactly on a single line.
     *
     * - `1` (default): Expands only top-level properties.
     * - `n > 1`: Expands up to `n` levels deep.
     * - `Infinity`: Unlimited depth.
     *
     * @default 1 (or `Infinity` if `maxInlineLength` is provided without `depthLimit`)
     */
    depthLimit?: number;

    /**
     * Maximum character length for compact inline representation.
     *
     * When specified:
     * - Objects and arrays whose compact stringified length is `<= maxInlineLength`
     *   remain on a single line.
     * - Array items are wrapped onto new lines when a row exceeds this character limit.
     *
     * @example 40 // Keep nodes shorter than 40 chars on one line
     */
    maxInlineLength?: number;
}


/**
 * Formats and stringifies an object hierarchy with customizable depth limits
 * and compact single-line thresholds.
 *
 * @param obj The object or value to format
 * @param options Formatting configuration options (or depth number)
 * @returns Formatted string representation, or `undefined` if `obj` is `undefined`
 *
 * @example
 * ```typescript
 * // Fixed depth:
 * formatHierarchy(data, { depthLimit: 2 });
 *
 * // Adaptive inline length:
 * formatHierarchy(data, { maxInlineLength: 40 });
 *
 * // Combined:
 * formatHierarchy(data, { depthLimit: 2, maxInlineLength: 40 });
 * ```
 */
export function formatHierarchy(
    obj: any,
    options?: FormatHierarchyOptions,
    currentDepth: number = 0,
    maxRecursionLimit: number = 99,
): string | undefined {
    if (obj === undefined) {
        return undefined;
    }

    const maxDepth = options?.depthLimit ?? Infinity;
    const maxInlineLength = options?.maxInlineLength;

    // If max depth reached, format inline (hard limit to prevent infinite recursion)
    if (currentDepth >= Math.min(maxRecursionLimit, maxDepth)) {
        return tryStringify(obj);
    }

    // If maxInlineLength is specified, check if the entire object fits on one line
    if (maxInlineLength !== undefined && typeof obj === "object" && obj !== null) {
        const stringified = tryStringify(obj);
        if (stringified.length <= maxInlineLength) {
            return stringified;
        }
    }

    if (obj && typeof obj === "object") {
        const nextDepth = currentDepth + 1;
        const indent = " ".repeat(nextDepth);
        const indentOuter = " ".repeat(currentDepth);

        if (Array.isArray(obj)) {
            if (!obj.length) {
                return "[]";
            }
            let result = "[\n";
            let childRow = `${indent}`;
            for (let i = 0; i < obj.length; i++) {
                const child = obj[i];
                let formattedChild: string | undefined = "";
                if (child !== undefined && child !== null) {
                    formattedChild = formatHierarchy(child, options, nextDepth);
                } else if (child === null) {
                    formattedChild = tryStringify(child);
                }

                childRow += `${formattedChild}, `;
                const shouldWrap =
                    maxInlineLength !== undefined
                        ? childRow.length > maxInlineLength
                        : true;

                if (i < obj.length - 1 && shouldWrap) {
                    result += `${childRow}\n`;
                    childRow = `${indent}`;
                }
            }
            result += `${childRow}\n`;
            result += `${indentOuter}]`;
            return result;
        } else {
            const keys = Object.keys(obj);
            if (!keys.length) {
                return "{}";
            }
            let result = "{\n";
            for (const k of keys) {
                const child = obj[k];
                if (child !== undefined && child !== null) {
                    result += `${indent}${JSON.stringify(k)}:${formatHierarchy(
                        child,
                        options,
                        nextDepth
                    )},\n`;
                } else if (child === null) {
                    result += `${indent}${JSON.stringify(k)}:${tryStringify(child)},\n`;
                }
            }
            result += `${indentOuter}}`;
            return result;
        }
    }

    return tryStringify(obj);
}

