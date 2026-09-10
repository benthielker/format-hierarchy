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
   "Ann", "Alice", "Bob", "Dan", "Charlie",
   "Eleanor", "Fiona", "Gina", "Harry", "Ivy",
   "Jack", "Kate", "Leo", "Mia", "Nick",
   "Olivia", "Pam", "Quinn", "Rose", "Sam",
   "Tina", "Uma", "Victor", "Wendy", "Xavier",
   "Yara", "Zack",
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

- **Width-Aware Line Wrapping (`wrapAtWidth`)**: Target a maximum column width in characters; items and lines wrap automatically once the threshold is reached.
- **Context-Aware Object Inlining**: Short objects and arrays stay compact on a single line if they fit within the remaining column width (accounting for indentation and property key length).
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

// Full multi-line formatting (default)
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

### Width-Aware Wrapping (`wrapAtWidth`)

```typescript
// Keep compact structures inline and wrap lines at 40 characters
const result = formatHierarchy(data, { wrapAtWidth: 40 });
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

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `wrapAtWidth` | `number` | `undefined` | Target line/column width in characters. When specified, short objects/arrays stay inline if they fit on the line, and array rows wrap once exceeding this width. |

## API

```typescript
export interface FormatHierarchyOptions {
  wrapAtWidth?: number;
}

export function formatHierarchy(
  obj: any,
  options?: FormatHierarchyOptions,
  currentDepth?: number,
  parentKeyPrefixLength?: number,
  maxRecursionLimit?: number
): string | undefined;
```

- **`obj`**: The object, array, or primitive value to format.
- **`options`** *(optional)*: Configuration object (`FormatHierarchyOptions`).
- **`currentDepth`** *(optional, default: 0)*: Internal recursion tracking.
- **`parentKeyPrefixLength`** *(optional, default: 0)*: Internal prefix length tracking for indentation calculation.
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
