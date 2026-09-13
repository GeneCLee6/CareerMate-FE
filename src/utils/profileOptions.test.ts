import {
    FIELD_OPTIONS,
    ROLE_OPTIONS,
    USER_FIELDS,
    USER_ROLES,
    toUserField,
    toUserRole,
} from "./profileOptions";

describe("the lists", () => {
    it("offers an option for every value in the union", () => {
        // A value in the type with no option is unreachable; an option with
        // no value in the type would not compile.
        expect(ROLE_OPTIONS.map((o) => o.value).sort()).toEqual(
            [...USER_ROLES].sort()
        );
        expect(FIELD_OPTIONS.map((o) => o.value).sort()).toEqual(
            [...USER_FIELDS].sort()
        );
    });

    it("uses words as values, not abbreviations", () => {
        // The value is what travels over the wire and gets stored; it should
        // not need a key to read.
        expect(USER_FIELDS).toContain("Frontend");
        expect(USER_FIELDS).not.toContain("FE");
        expect(USER_FIELDS).not.toContain("BE");
    });

    it("gives every option a label", () => {
        for (const option of [...ROLE_OPTIONS, ...FIELD_OPTIONS]) {
            expect(option.label.trim()).not.toBe("");
        }
    });

    it("has no duplicate values within a list", () => {
        // Checked per list, not across them: "Other" belongs in both, and is
        // not a duplicate.
        for (const list of [ROLE_OPTIONS, FIELD_OPTIONS]) {
            const values = list.map((o) => o.value);
            expect(new Set(values).size).toBe(values.length);
        }
    });
});

describe("narrowing a value from a form", () => {
    it("accepts every offered value", () => {
        for (const role of USER_ROLES) expect(toUserRole(role)).toBe(role);
        for (const field of USER_FIELDS) expect(toUserField(field)).toBe(field);
    });

    it("returns undefined for anything else", () => {
        // This is what replaced four `as` casts that would have sent a value
        // the type said was impossible.
        expect(toUserRole("Wizard")).toBeUndefined();
        expect(toUserField("Blockchain")).toBeUndefined();
        expect(toUserField("")).toBeUndefined();
    });

    it("returns undefined for a renamed code, leaving the backend to translate", () => {
        // The old codes are not offered any more. The backend still accepts
        // them from a cached bundle; the current one should not send them.
        expect(toUserField("FE")).toBeUndefined();
    });
});
