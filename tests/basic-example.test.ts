import { describe, it, expect } from "vitest";
import { formatHierarchy } from "../src/index.js";


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

describe("formatHierarchy", () => {
    it("should format as expected", () => {
        const result = formatHierarchy(data);
        console.log(result);
        expect(result).toBeTruthy();
    });
});
