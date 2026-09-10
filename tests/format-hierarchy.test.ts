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

  it("should format simple shallow object with default depth (1)", () => {
    const input = { a: 1, b: "two" };
    const result = formatHierarchy(input);
    expect(result).toBe('{\n "a":1,\n "b":"two",\n}');
  });

  it("should format simple array with default depth (1)", () => {
    const input = [1, 2, 3];
    const result = formatHierarchy(input);
    expect(result).toContain("1,");
    expect(result).toContain("2,");
    expect(result).toContain("3,");
  });

  it("should format nested objects based on depth limit", () => {
    const nested = {
      level1: {
        level2: {
          level3: "deep",
        },
      },
    };

    // Depth 1: top level expanded, level1 stringified inline
    const depth1 = formatHierarchy(nested, { depthLimit: 1 });
    expect(depth1).toBe('{\n "level1":{"level2":{"level3":"deep"}},\n}');

    // Depth 2: level1 is expanded, level2 stringified inline
    const depth2 = formatHierarchy(nested, { depthLimit: 2 });
    expect(depth2).toBe(
      '{\n "level1":{\n  "level2":{"level3":"deep"},\n },\n}'
    );

    // Depth 3: level1 and level2 are expanded
    const depth3 = formatHierarchy(nested, { depthLimit: 3 });
    expect(depth3).toBe(
      '{\n "level1":{\n  "level2":{\n   "level3":"deep",\n  },\n },\n}'
    );
  })

  it("should pretty-print entire hierarchy when depthLimit is Infinity", () => {
    const nested = {
      user: {
        name: "Alice",
        roles: ["admin", "editor"],
      },
    };
    const result = formatHierarchy(nested, { depthLimit: Infinity });
    expect(result).toEqual(`{
 "user":{
  "name":"Alice",
  "roles":[
   "admin", 
   "editor", 
  ],
 },
}`
    );
  });

  it("should collapse short objects and expand long objects when maxInlineLength specified", () => {
    const shortObj = { a: 1, b: 2 };
    // Short object length is 13 chars, threshold is 50
    const shortResult = formatHierarchy(shortObj, { maxInlineLength: 50 });
    expect(shortResult).toBe(JSON.stringify(shortObj));

    // Long object exceeds threshold 10
    const longResult = formatHierarchy(shortObj, { maxInlineLength: 10 });
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

  it("should wrap long arrays of short values when formatDepth < -1", () => {
    const nested = {
      team: {
        name: "Support",
        members: ["Ann", "Alice", "Bob", "Dan", "Charlie", "Eleanor", "Fiona", "Gina", "Harry", "Ivy", "Jack", "Kate", "Leo", "Mia", "Nick", "Olivia", "Pam", "Quinn", "Rose", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zack"],
      },
    };
    const result = formatHierarchy(nested, { maxInlineLength: 50 });
    expect(result).toBe('{\n "team":{\n  "name":"Support",\n  "members":[\n   "Ann", "Alice", "Bob", "Dan", "Charlie", "Eleanor", \n   "Fiona", "Gina", "Harry", "Ivy", "Jack", "Kate", \n   "Leo", "Mia", "Nick", "Olivia", "Pam", "Quinn", \n   "Rose", "Sam", "Tina", "Uma", "Victor", "Wendy", \n   "Xavier", "Yara", "Zack", \n  ],\n },\n}');
  });

  it("should inline and wrap lists of short objects when formatDepth < -1", () => {
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
    const result = formatHierarchy(nested, { maxInlineLength: 40 });

    expect(result).toBe(`{
 "team":{
  "name":"Support",
  "members":[
   {"name":"Ann","role":"admin"}, {"name":"Bob","role":"developer"}, 
   {"name":"Charlie","role":"tester"}, {"name":"Dan","role":"project manager"}, 
   {"name":"Eve","role":"designer"}, {
    "name":"Frank",
    "role":"assistant to the regional sales manager",
   }, 
   {
    "name":"Guy",
    "role":"deputy assistant to the regional sales manager",
   }, 
   {"name":"Hank","role":"intern"}, {"name":"Inga","role":"intern"}, 
  ],
 },
}`);
  });
});

describe("formatHierarchy2", () => {
  const teamData = {
    team: {
      name: "Support",
      members: [
        { name: "Ann", role: "admin" },
        { name: "Bob", role: "developer" },
        { name: "Charlie", role: "tester" },
        { name: "Dan", role: "project manager" },
        { name: "Eve", role: "designer" },
        { name: "Frank", role: "assistant to the regional sales manager" },
        { name: "Guy", role: "deputy assistant to the regional sales manager" },
        { name: "Hank", role: "intern" },
        { name: "Inga", role: "intern" },
      ],
    },
  };

  it("should format with maxInlineLength across all levels when depth is omitted (Infinity)", () => {
    const result = formatHierarchy(teamData, { maxInlineLength: 40 });
    expect(result).toBe(formatHierarchy(teamData, { depthLimit: Infinity, maxInlineLength: 40 }));
  });

  it("should wrap long arrays of strings with maxInlineLength", () => {
    const data = {
      team: {
        name: "Support",
        members: ["Ann", "Alice", "Bob", "Dan", "Charlie", "Eleanor", "Fiona", "Gina", "Harry", "Ivy", "Jack", "Kate", "Leo", "Mia", "Nick", "Olivia", "Pam", "Quinn", "Rose", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zack"],
      },
    };
    expect(formatHierarchy(data, { maxInlineLength: 50 })).toBe(formatHierarchy(data, { depthLimit: Infinity, maxInlineLength: 50 }));
  });

  it("should combine depth limit with maxInlineLength without conflict", () => {
    // When depth is 1, top level "team" is expanded, but inside "team" is depth 1, which exceeds maxDepth (1)
    // so team contents stay collapsed inline.
    const depth1 = formatHierarchy(teamData, { depthLimit: 1, maxInlineLength: 40 });
    expect(depth1).toBe('{\n "team":{"name":"Support","members":[{"name":"Ann","role":"admin"},{"name":"Bob","role":"developer"},{"name":"Charlie","role":"tester"},{"name":"Dan","role":"project manager"},{"name":"Eve","role":"designer"},{"name":"Frank","role":"assistant to the regional sales manager"},{"name":"Guy","role":"deputy assistant to the regional sales manager"},{"name":"Hank","role":"intern"},{"name":"Inga","role":"intern"}]},\n}');

    // When depth is 2, "team" and its children ("name", "members") are formatted, but elements inside "members"
    // are at depth 3 (> depth 2), so each member object remains compact/inline even if long.
    const depth2 = formatHierarchy(teamData, { depthLimit: 2, maxInlineLength: 40 });
    expect(depth2).toContain('"name":"Support"');
    expect(depth2).toContain('{"name":"Frank","role":"assistant to the regional sales manager"}');


    // When depth is 3, "team" and its children ("name", "members") are formatted, but elements inside "members"
    // are at depth 3 (<= depth 3), so each member object is expanded.
    const depth3 = formatHierarchy(teamData, { depthLimit: 3, maxInlineLength: 40 });
    expect(depth3).toContain('"name":"Support"');
    expect(depth3).toContain('{"name":"Frank","role":"assistant to the regional sales manager"}');

    // When depth is 3, "team" and its children ("name", "members") are formatted, but elements inside "members"
    // are at depth 3 (<= depth 3), so each member object is expanded.
    const depth4 = formatHierarchy(teamData, { depthLimit: 4, maxInlineLength: 40 });
    expect(depth4).toContain('"name":"Support"');
    expect(depth4).not.toContain('{"name":"Frank","role":"assistant to the regional sales manager"}');
    expect(depth4).toContain('"name":"Frank",');
    expect(depth4).toContain('"role":"assistant to the regional sales manager"');
  });

  it("should handle undefined and primitives cleanly", () => {
    expect(formatHierarchy(undefined)).toBeUndefined();
    expect(formatHierarchy(null)).toBe("null");
    expect(formatHierarchy(123)).toBe("123");
    expect(formatHierarchy("test")).toBe('"test"');
  });
});

