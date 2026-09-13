import { SelectOption } from "../components/SelectField";

/**
 * Mirrors `CareerMate-BE/src/users/profileOptions.js`, which is the source of
 * truth. These are the same codes, with labels written for a person.
 *
 * The types are derived from the arrays rather than written out beside them:
 * adding an option to the list is then enough, and cannot leave a union type a
 * version behind. Before this, `role` was typed `"Student" | "Other"` and the
 * call sites cast to it — so a new option would have compiled cleanly and been
 * sent as a value TypeScript had been told was impossible.
 */

export const USER_ROLES = [
    "Student",
    "Graduate",
    "Bootcamp",
    "SelfTaught",
    "CareerChanger",
    "Professional",
    "Other",
] as const;

export const USER_FIELDS = [
    "Frontend",
    "Backend",
    "FullStack",
    "Mobile",
    "DataScience",
    "MachineLearning",
    "DevOps",
    "Cloud",
    "QA",
    "Security",
    "Design",
    "ProductManagement",
    "Other",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserField = (typeof USER_FIELDS)[number];

/** A SelectOption whose value is checked against the union. */
interface TypedOption<T extends string> extends SelectOption {
    value: T;
}

export const ROLE_OPTIONS: TypedOption<UserRole>[] = [
    { value: "Student", label: "Student" },
    { value: "Graduate", label: "Recent graduate" },
    { value: "Bootcamp", label: "Bootcamp graduate" },
    { value: "SelfTaught", label: "Self-taught developer" },
    { value: "CareerChanger", label: "Changing career into tech" },
    { value: "Professional", label: "Working professional" },
    { value: "Other", label: "Other" },
];

export const FIELD_OPTIONS: TypedOption<UserField>[] = [
    { value: "Frontend", label: "Frontend" },
    { value: "Backend", label: "Backend" },
    { value: "FullStack", label: "Full-stack" },
    { value: "Mobile", label: "Mobile" },
    { value: "DataScience", label: "Data Science & Analytics" },
    { value: "MachineLearning", label: "Machine Learning / AI" },
    { value: "DevOps", label: "DevOps & Infrastructure" },
    { value: "Cloud", label: "Cloud Engineering" },
    { value: "QA", label: "QA & Testing" },
    { value: "Security", label: "Security" },
    { value: "Design", label: "UI/UX Design" },
    { value: "ProductManagement", label: "Product Management" },
    { value: "Other", label: "Other" },
];

/** Narrows a string from a form back to the union, or undefined if unknown. */
export function toUserRole(value: string): UserRole | undefined {
    return USER_ROLES.find((role) => role === value);
}

export function toUserField(value: string): UserField | undefined {
    return USER_FIELDS.find((field) => field === value);
}
