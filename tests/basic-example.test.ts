import { describe, it, expect } from "vitest";
import { formatHierarchy } from "../src/index.js";

const data1 = {
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

const data2 = {
    team: {
        name: "Support",
        members: ["Ann", "Alice", "Bob", "Dan", "Charlie", "Eleanor", "Fiona", "Gina", "Harry", "Ivy", "Jack", "Kate", "Leo", "Mia", "Nick", "Olivia", "Pam", "Quinn", "Rose", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zack"],
    },
};

const data3 = {
    team: {
        name: "Support",
        members: [
            { "name": "Ann", "role": "admin", "aliases": ["Anna", "Annabel", "Annie", "Beth"] },
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

describe("formatHierarchy basic examples", () => {
    it("should format as expected across different wrap widths", () => {
        const result20 = formatHierarchy(data1);
        expect(result20?.split("\n").length).toBe(13);
        console.log('result20' + '-'.repeat(20 - 8), result20);
        const result21 = formatHierarchy(data1, { wrapAtWidth: 20 });
        expect(result21?.split("\n").length).toBe(14);
        console.log('result21' + '-'.repeat(20 - 8), result21);
        const result22 = formatHierarchy(data2, { wrapAtWidth: 20 });
        expect(result22?.split("\n").length).toBe(23);
        console.log('result22' + '-'.repeat(20 - 8), result22);
        const result23 = formatHierarchy(data3, { wrapAtWidth: 20 });
        expect(result23?.split("\n").length).toBe(49);
        console.log('result23' + '-'.repeat(20 - 8), result23);

        const result30 = formatHierarchy(data1);
        expect(result30?.split("\n").length).toBe(13);
        console.log('result30' + '-'.repeat(30 - 8), result30);
        const result31 = formatHierarchy(data1, { wrapAtWidth: 30 });
        expect(result31?.split("\n").length).toBe(11);
        console.log('result31' + '-'.repeat(30 - 8), result31);
        const result32 = formatHierarchy(data2, { wrapAtWidth: 30 });
        expect(result32?.split("\n").length).toBe(17);
        console.log('result32' + '-'.repeat(30 - 8), result32);
        const result33 = formatHierarchy(data3, { wrapAtWidth: 30 });
        expect(result33?.split("\n").length).toBe(47);
        console.log('result33' + '-'.repeat(30 - 8), result33);

        const result40 = formatHierarchy(data1);
        expect(result40?.split("\n").length).toBe(13);
        console.log('result40' + '-'.repeat(40 - 8), result40);
        const result41 = formatHierarchy(data1, { wrapAtWidth: 40 });
        expect(result41?.split("\n").length).toBe(11);
        console.log('result41' + '-'.repeat(40 - 8), result41);
        const result42 = formatHierarchy(data2, { wrapAtWidth: 40 });
        expect(result42?.split("\n").length).toBe(14);
        console.log('result42' + '-'.repeat(40 - 8), result42);
        const result43 = formatHierarchy(data3, { wrapAtWidth: 40 });
        expect(result43?.split("\n").length).toBe(32);
        console.log('result43' + '-'.repeat(40 - 8), result43);

        const result50 = formatHierarchy(data1);
        expect(result50?.split("\n").length).toBe(13);
        console.log('result50' + '-'.repeat(50 - 8), result50);
        const result51 = formatHierarchy(data1, { wrapAtWidth: 50 });
        expect(result51?.split("\n").length).toBe(8);
        console.log('result51' + '-'.repeat(50 - 8), result51);
        const result52 = formatHierarchy(data2, { wrapAtWidth: 50 });
        expect(result52?.split("\n").length).toBe(13);
        console.log('result52' + '-'.repeat(50 - 8), result52);
        const result53 = formatHierarchy(data3, { wrapAtWidth: 50 });
        expect(result53?.split("\n").length).toBe(26);
        console.log('result53' + '-'.repeat(50 - 8), result53);

        const result60 = formatHierarchy(data1);
        expect(result60?.split("\n").length).toBe(13);
        console.log('result60' + '-'.repeat(60 - 8), result60);
        const result61 = formatHierarchy(data1, { wrapAtWidth: 60 });
        expect(result61?.split("\n").length).toBe(8);
        console.log('result61' + '-'.repeat(60 - 8), result61);
        const result62 = formatHierarchy(data2, { wrapAtWidth: 60 });
        expect(result62?.split("\n").length).toBe(12);
        console.log('result62' + '-'.repeat(60 - 8), result62);
        const result63 = formatHierarchy(data3, { wrapAtWidth: 60 });
        expect(result63?.split("\n").length).toBe(26);
        console.log('result63' + '-'.repeat(60 - 8), result63);

        const result70 = formatHierarchy(data1);
        expect(result70?.split("\n").length).toBe(13);
        console.log('result70' + '-'.repeat(70 - 8), result70);
        const result71 = formatHierarchy(data1, { wrapAtWidth: 70 });
        expect(result71?.split("\n").length).toBe(8);
        console.log('result71' + '-'.repeat(70 - 8), result71);
        const result72 = formatHierarchy(data2, { wrapAtWidth: 70 });
        expect(result72?.split("\n").length).toBe(11);
        console.log('result72' + '-'.repeat(70 - 8), result72);
        const result73 = formatHierarchy(data3, { wrapAtWidth: 70 });
        expect(result73?.split("\n").length).toBe(22);
        console.log('result73' + '-'.repeat(70 - 8), result73);

        const result80 = formatHierarchy(data1);
        expect(result80?.split("\n").length).toBe(13);
        console.log('result80' + '-'.repeat(80 - 8), result80);
        const result81 = formatHierarchy(data1, { wrapAtWidth: 80 });
        expect(result81?.split("\n").length).toBe(5);
        console.log('result81' + '-'.repeat(80 - 8), result81);
        const result82 = formatHierarchy(data2, { wrapAtWidth: 80 });
        expect(result82?.split("\n").length).toBe(11);
        console.log('result82' + '-'.repeat(80 - 8), result82);
        const result83 = formatHierarchy(data3, { wrapAtWidth: 80 });
        expect(result83?.split("\n").length).toBe(13);
        console.log('result83' + '-'.repeat(80 - 8), result83);
    });
});
