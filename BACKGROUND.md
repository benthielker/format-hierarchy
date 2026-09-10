# Background & Origins

## The Story Behind `format-hierarchy`

Around 2018, while working with large JSON payloads, standard JSON formatting options often fell short:

- **Single-line JSON (`JSON.stringify(data)`)**: Dense and difficult to parse visually when inspecting complex or nested structures.
- **Full pretty-printed JSON (`JSON.stringify(data, null, 2)`)**: Expanded every single array item and key-value pair onto its own line. For data structures with long lists of short values (e.g., tags, IDs, lists of names) or arrays of small objects, this resulted in hundreds of lines of vertical scrolling for minimal information density.

To strike the right balance, `formatHierarchy` was designed to intelligently inline short values and small objects on a single line, wrapping only when the line length exceeds a configurable width limit or recursion threshold.

---

## Original 2018 Draft (For Posterity)

Below is the original draft implementation created during that period:

```javascript
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
export function formatHierarchy(
    obj,
    formatDepth,
    atDepth,
) {
    if (obj === undefined) {
        return undefined;
    }
    let forcedFormatDepth;
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
                        let formattedChild = "";
                        if (child !== undefined && child !== null) {
                            formattedChild = formatHierarchy(
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
                            )}: ${formatHierarchy(
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
```
