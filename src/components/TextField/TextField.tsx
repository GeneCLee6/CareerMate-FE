import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import styled from "styled-components";
import { colors, control } from "../../styles/tokens";

const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: 14px;
    color: ${colors.label};
`;

const InputShell = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

/**
 * The invalid styling hangs off `aria-invalid` rather than a styled prop so the
 * visual state and the state screen readers announce can never drift apart.
 */
const Input = styled.input<{ $hasAdornment: boolean }>`
    width: 100%;
    height: ${control.height};
    padding: 0 ${({ $hasAdornment }) => ($hasAdornment ? "48px" : "20px")} 0 20px;
    font-size: 15px;
    font-family: inherit;
    color: ${colors.text};
    background-color: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${control.radius};
    outline: none;
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;

    &::placeholder {
        color: ${colors.placeholder};
    }

    &:focus {
        border-color: ${colors.borderFocus};
        box-shadow: 0 0 0 3px rgba(80, 79, 253, 0.15);
    }

    &[aria-invalid="true"] {
        border-color: ${colors.danger};
    }

    &[aria-invalid="true"]:focus {
        border-color: ${colors.danger};
        box-shadow: 0 0 0 3px rgba(255, 50, 50, 0.15);
    }

    &:disabled {
        background-color: #fafafa;
        cursor: not-allowed;
    }
`;

const Adornment = styled.div`
    position: absolute;
    right: 16px;
    display: flex;
    align-items: center;
`;

export interface TextFieldProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
    id: string;
    label: string;
    invalid?: boolean;
    /** Rendered inside the field, e.g. the password visibility toggle. */
    adornment?: ReactNode;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
    ({ id, label, invalid, adornment, ...inputProps }, ref) => (
        <Field>
            <Label htmlFor={id}>{label}</Label>
            <InputShell>
                <Input
                    {...inputProps}
                    id={id}
                    ref={ref}
                    $hasAdornment={Boolean(adornment)}
                    aria-invalid={invalid ? "true" : undefined}
                />
                {adornment && <Adornment>{adornment}</Adornment>}
            </InputShell>
        </Field>
    )
);

TextField.displayName = "TextField";

export default TextField;
