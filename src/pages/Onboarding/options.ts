import { SelectOption } from "../../components/SelectField";

export const ONBOARDING_STEPS = [
    "Welcome",
    "Basic Information",
    "Finish",
] as const;

/** Values match the backend's enums (Student | Other, FE | BE). */
export const ROLE_OPTIONS: SelectOption[] = [
    { value: "Student", label: "Student" },
    { value: "Other", label: "Other" },
];

export const FIELD_OPTIONS: SelectOption[] = [
    { value: "FE", label: "Frontend" },
    { value: "BE", label: "Backend" },
];

/** `goal` is free text on the server; these are the presets the design offers. */
export const GOAL_OPTIONS: SelectOption[] = [
    { value: "Looking for internship", label: "Looking for internship" },
    { value: "Looking for a full-time role", label: "Looking for a full-time role" },
    {
        value: "Optimize my resume and get an internship",
        label: "Optimize my resume and get an internship",
    },
    { value: "Preparing for interviews", label: "Preparing for interviews" },
    { value: "Growing my current skills", label: "Growing my current skills" },
];
