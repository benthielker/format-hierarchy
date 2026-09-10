# format-hierarchy

A lightweight TypeScript / JavaScript utility to format and stringify objects and hierarchies with an emphasis on consuming less space when long lists of short values are present.

## Examples

Useful for...

#### Wrapping long arrays of short values 
```json
{
 "team":{
  "name":"Support",
  "members":[
   "Ann", "Alice", "Bob", "Dan", "Charlie", "Eleanor", 
   "Fiona", "Gina", "Harry", "Ivy", "Jack", "Kate", 
   "Leo", "Mia", "Nick", "Olivia", "Pam", "Quinn", 
   "Rose", "Sam", "Tina", "Uma", "Victor", "Wendy", 
   "Xavier", "Yara", "Zack", 
  ],
 },
}
```

#### Inlining and wrapping lists of short objects
```json
{
 "team":{
  "name":"Support",
  "members":[
   {"name":"Ann","role":"admin"}, {"name":"Bob","role":"developer"}, 
   {"name":"Charlie","role":"tester"}, 
   {"name":"Dan","role":"project manager"}, 
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
}
```

## Installation

```bash
npm install format-hierarchy
```

or with yarn / pnpm / bun:

```bash
pnpm add format-hierarchy
```

## Features

- **Custom Depth Limiting (`depthLimit`)**: Limit how many levels deep the formatter expands before keeping deeper nodes inline.
- **Adaptive Inline Thresholds (`maxInlineLength`)**: Keep short objects and arrays compact on a single line, only expanding nodes that exceed your character threshold.
- **Array Wrapping**: Automatically wraps long arrays of short items across multiple rows once a row exceeds `maxInlineLength`.
- **Safe Stringification**: Safely catches circular references or serialization errors by embedding error messages instead of throwing.
- **Dual Package**: Provides full TypeScript definitions (`.d.ts`), ES Modules (`esm`), and CommonJS (`cjs`) builds.

## Usage

### Basic Example

```typescript
import { formatHierarchy } from "format-hierarchy";

const data = {
  id: "user-123",
  profile: {
    name: "Alice",
    settings: {
      theme: "dark",
      notifications: true,
    },
  },
  tags: ["admin", "developer"],
};

// Default formatting (depthLimit = Infinity)
console.log(formatHierarchy(data));
```

Output:
```
{
 "id":"user-123",
 "profile":{
  "name":"Alice",
  "settings":{
   "theme":"dark",
   "notifications":true,
  },
 },
 "tags":[
  "admin", 
  "developer", 
 ],
}
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `depthLimit` | `number` | `Infinity` | Maximum nesting depth to expand multi-line. Nodes at or beyond this depth remain serialized inline on a single line. |
| `maxInlineLength` | `number` | `undefined` | Maximum character length for compact inline representations. Nodes with serialized length `<= maxInlineLength` remain on one line, and array rows wrap when exceeding this limit. |

### Option Examples

#### 1. Fixed Depth Limiting (`depthLimit`)

```typescript
// Only expand top-level properties; deeper nested objects stay inline
const depth1 = formatHierarchy(data, { depthLimit: 1 });
```

Output:
```
{
 "id":"user-123",
 "profile":{"name":"Alice","settings":{"theme":"dark","notifications":true}},
 "tags":["admin","developer"],
}
```

#### 2. Adaptive Line Length (`maxInlineLength`)

```typescript
// Short objects and lists stay inline; nodes exceeding 40 characters expand
const compact = formatHierarchy(data, { maxInlineLength: 40 });
```

Output:
```
{
 "id":"user-123",
 "profile":{
  "name":"Alice",
  "settings":{"theme":"dark","notifications":true},
 },
 "tags":[
  "admin", "developer", 
 ],
}
```

#### 3. Combined Depth and Length Limits

```typescript
// Expand up to 2 levels deep, but inline any children under 50 characters
const result = formatHierarchy(data, {
  depthLimit: 2,
  maxInlineLength: 50,
});
```

## API

```typescript
export interface FormatHierarchyOptions {
  depthLimit?: number;
  maxInlineLength?: number;
}

export function formatHierarchy(
  obj: any,
  options?: FormatHierarchyOptions,
  currentDepth?: number,
  maxRecursionLimit?: number
): string | undefined;
```

- **`obj`**: The object, array, or primitive value to format.
- **`options`** *(optional)*: Configuration object (`FormatHierarchyOptions`).
- **`currentDepth`** *(optional, default: 0)*: Internal recursion tracking.
- **`maxRecursionLimit`** *(optional, default: 99)*: Maximum allowable recursion depth before halting.

## Development

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Type check
npm run typecheck

# Build library (ESM, CJS, and .d.ts)
npm run build
```

## License

MIT
