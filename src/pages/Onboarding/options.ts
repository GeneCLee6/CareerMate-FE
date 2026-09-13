import { SelectOption } from "../../components/SelectField";

export const ONBOARDING_STEPS = [
    "Welcome",
    "Basic Information",
    "Finish",
] as const;

// The role and field lists live with the types they belong to, so a new
// option cannot be added without the union knowing about it.
export { ROLE_OPTIONS, FIELD_OPTIONS } from "../../utils/profileOptions";

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
