import { useState } from "react";
import styled from "styled-components";
import TextField, { TextFieldProps } from "../TextField/TextField";
import { colors } from "../../styles/tokens";

const ToggleButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: none;
    color: ${colors.label};
    cursor: pointer;

    &:hover {
        color: ${colors.text};
    }
`;

const EyeIcon = ({ off }: { off: boolean }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
        {off && <path d="M3 3l18 18" />}
    </svg>
);

export type PasswordFieldProps = Omit<
    TextFieldProps,
    "type" | "adornment"
>;

const PasswordField = (props: PasswordFieldProps) => {
    const [visible, setVisible] = useState(false);

    return (
        <TextField
            {...props}
            type={visible ? "text" : "password"}
            adornment={
                <ToggleButton
                    type="button"
                    onClick={() => setVisible((prev) => !prev)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                >
                    <EyeIcon off={!visible} />
                </ToggleButton>
            }
        />
    );
};

export default PasswordField;
