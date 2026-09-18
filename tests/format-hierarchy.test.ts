import { describe, it, expect } from "vitest";
import { formatHierarchy } from "../src/index.js";

describe("formatHierarchy", () => {
  it("should handle undefined input", () => {
    expect(formatHierarchy(undefined)).toBeUndefined();
  });

  it("should handle null input", () => {
    expect(formatHierarchy(null)).toBe("null");
  });

  it("should handle primitive values", () => {
    expect(formatHierarchy(42)).toBe("42");
    expect(formatHierarchy("hello")).toBe('"hello"');
    expect(formatHierarchy(true)).toBe("true");
  });

  it("should handle empty object and array", () => {
    expect(formatHierarchy({})).toBe("{}");
    expect(formatHierarchy([])).toBe("[]");
  });

  it("should format simple shallow object", () => {
    const input = { a: 1, b: "two" };
    const result = formatHierarchy(input);
    expect(result).toBe('{\n "a":1,\n "b":"two",\n}');
  });

  it("should format simple array", () => {
    const input = [1, 2, 3];
    const result = formatHierarchy(input);
    expect(result).toBe('[\n 1, 2, 3,\n]');
  });

  it("should collapse short objects and expand long objects when wrapAtWidth is specified", () => {
    const shortObj = { a: 1, b: 2 };
    // Short object length is 13 chars, wrapAtWidth is 50
    const shortResult = formatHierarchy(shortObj, { wrapAtWidth: 50 });
    expect(shortResult).toBe(JSON.stringify(shortObj));

    // Long object exceeds threshold 10
    const longResult = formatHierarchy(shortObj, { wrapAtWidth: 10 });
    expect(longResult).toContain("\n");
    expect(longResult).toContain('"a":1');
  });

  it("should safely handle circular references without throwing", () => {
    const circular: any = { a: 1 };
    circular.self = circular;

    expect(() => {
      const res = formatHierarchy(circular);
      expect(typeof res).toBe("string");
    }).not.toThrow();
  });

  it("should wrap long arrays of short values within wrapAtWidth", () => {
    const nested = {
      team: {
        name: "Support",
        members: ["Ann", "Alice", "Bob", "Dan", "Charlie", "Eleanor", "Fiona", "Gina", "Harry", "Ivy", "Jack", "Kate", "Leo", "Mia", "Nick", "Olivia", "Pam", "Quinn", "Rose", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zack"],
      },
    };
    const result = formatHierarchy(nested, { wrapAtWidth: 50 });
    expect(result).toBe(`{
 "team":{
  "name":"Support",
  "members":[
   "Ann", "Alice", "Bob", "Dan", "Charlie",
   "Eleanor", "Fiona", "Gina", "Harry", "Ivy",
   "Jack", "Kate", "Leo", "Mia", "Nick",
   "Olivia", "Pam", "Quinn", "Rose", "Sam",
   "Tina", "Uma", "Victor", "Wendy", "Xavier",
   "Yara", "Zack",
  ],
 },
}`);
  });

  it("should inline short objects in arrays when fitting within wrapAtWidth", () => {
    const nested = {
      team: {
        name: "Support",
        members: [
          { "name": "Ann", "role": "admin" },
          { "name": "Bob", "role": "developer" },
          { "name": "Charlie", "role": "tester" },
          { "name": "Dan", "role": "project manager" },
          { "name": "Eve", "role": "designer" },
          { "name": "Frank", "role": "assistant to the regional sales manager" },
          { "name": "Guy", "role": "deputy assistant to the regional sales manager" },
          { "name": "Hank", "role": "intern" },
          { "name": "Inga", "role": "intern" },
        ],
      },
    };
    const result = formatHierarchy(nested, { wrapAtWidth: 40 });

    expect(result).toBe(`{
 "team":{
  "name":"Support",
  "members":[
   {"name":"Ann","role":"admin"},
   {"name":"Bob","role":"developer"},
   {"name":"Charlie","role":"tester"},
   {
    "name":"Dan",
    "role":"project manager",
   },
   {"name":"Eve","role":"designer"},
   {
    "name":"Frank",
    "role":"assistant to the regional sales manager",
   },
   {
    "name":"Guy",
    "role":"deputy assistant to the regional sales manager",
   },
   {"name":"Hank","role":"intern"},
   {"name":"Inga","role":"intern"},
  ],
 },
}`);
  });

  it("should handle undefined values inside arrays and objects", () => {
    expect(formatHierarchy([1, undefined, 2])).toBe('[\n 1, null, 2,\n]'); // or expected design
    expect(formatHierarchy({ a: undefined, b: 1 })).toBe('{\n "b":1,\n}');
  });

  it("should format shared object instances in DAGs without treating them as circular", () => {
    const shared = { name: "shared", value: 42 };
    const root = { first: shared, second: shared };
    const result = formatHierarchy(root);
    expect(result).toBe('{\n "first":{\n  "name":"shared",\n  "value":42,\n },\n "second":{\n  "name":"shared",\n  "value":42,\n },\n}');
  });

  it("should handle circular arrays and mutual circular loops without stack overflow", () => {
    const arr: any[] = [1, 2];
    arr.push(arr);
    expect(() => formatHierarchy(arr)).not.toThrow();

    const nodeA: any = { name: "A" };
    const nodeB: any = { name: "B", parent: nodeA };
    nodeA.child = nodeB;
    expect(() => formatHierarchy(nodeA)).not.toThrow();
  });

  it("should truncate expansion and fallback to stringify when maxRecursionLimit is hit", () => {
    const deepObj = { a: { b: { c: { d: 1 } } } };
    const result = formatHierarchy(deepObj, undefined, 0, 0, 2);
    expect(result).toBe('{\n "a":{\n  "b":{"c":{"d":1}},\n },\n}');
  });

  it("should handle non-standard primitives and throw-prone types gracefully", () => {
    expect(formatHierarchy(NaN)).toBe("null");
    expect(formatHierarchy(Infinity)).toBe("null");
    expect(formatHierarchy(10n)).toContain("BigInt"); // verifies tryStringify catch branch
  });

  it("should format object keys containing special characters or quotes", () => {
    const input = { 'key "with" quotes': 1, "line\nbreak": 2, "a:b": 3 };
    const result = formatHierarchy(input);
    expect(result).toContain('"key \\"with\\" quotes":1');
    expect(result).toContain('"line\\nbreak":2');
  });

});
