export interface ContactFormValues {
    fullName: string;
    email: string;
    role: string;
    field: string;
    message: string;
}

export type ContactFieldName = keyof ContactFormValues;

export type ContactFormErrors = Partial<Record<ContactFieldName, string>>;

export const EMPTY_CONTACT_FORM: ContactFormValues = {
    fullName: "",
    email: "",
    role: "",
    field: "",
    message: "",
};

interface FieldRule {
    required?: boolean;
    minLength?: number;
    message: string;
}

const RULES: Partial<Record<ContactFieldName, FieldRule>> = {
    fullName: {
        required: true,
        minLength: 2,
        message: "Please enter your full name at least 2 characters",
    },
    message: {
        required: true,
        minLength: 10,
        message: "Please enter your message at least 10 characters",
    },
    role: {
        required: true,
        message: "Please select your role",
    },
};

export function validateContactField(
    name: ContactFieldName,
    value: string
): string | undefined {
    const rule = RULES[name];

    if (!rule) return undefined;

    const trimmed = value.trim();

    if (rule.required && !trimmed) {
        return rule.message;
    }

    if (rule.minLength && trimmed.length < rule.minLength) {
        return rule.message;
    }

    return undefined;
}

export function validateContactForm(
    values: ContactFormValues
): ContactFormErrors {
    const errors: ContactFormErrors = {};

    (Object.keys(RULES) as ContactFieldName[]).forEach((name) => {
        const error = validateContactField(name, values[name]);
        if (error) {
            errors[name] = error;
        }
    });

    return errors;
}
