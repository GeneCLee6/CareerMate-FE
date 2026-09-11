import { SelectHTMLAttributes, forwardRef } from "react";
import styled from "styled-components";
import { colors } from "../../styles/tokens";

const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: 14px;
    color: ${colors.label};
`;

/** Chevron is an inline data URI so no network request is needed for it. */
const Select = styled.select<{ $radius: string; $placeholder: boolean }>`
    width: 100%;
    height: 48px;
    padding: 0 44px 0 20px;
    font-size: 15px;
    font-family: inherit;
    color: ${({ $placeholder }) =>
        $placeholder ? colors.placeholder : colors.text};
    background-color: #fff;
    border: 1px solid ${colors.border};
    border-radius: ${({ $radius }) => $radius};
    outline: none;
    appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(89,89,89)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
    background-repeat: no-repeat;
    background-position: right 18px center;
    background-size: 16px;
    cursor: pointer;
    transition: border-color 0.2s ease;

    &:focus {
        border-color: ${colors.borderFocus};
    }

    &[aria-invalid="true"] {
        border-color: ${colors.danger};
    }
`;

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectFieldProps
    extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "children"> {
    id: string;
    label: string;
    options: SelectOption[];
    /** Shown as the empty first entry; the design labels it "Selected". */
    placeholder?: string;
    invalid?: boolean;
    /** Pill on onboarding, softer corners in settings. */
    radius?: string;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
    (
        {
            id,
            label,
            options,
            placeholder = "Selected",
            invalid,
            radius = "24px",
            value,
            ...selectProps
        },
        ref
    ) => (
        <Field>
            <Label htmlFor={id}>{label}</Label>
            <Select
                {...selectProps}
                id={id}
                ref={ref}
                value={value}
                $radius={radius}
                $placeholder={!value}
                aria-invalid={invalid ? "true" : undefined}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </Select>
        </Field>
    )
);

SelectField.displayName = "SelectField";

export default SelectField;
