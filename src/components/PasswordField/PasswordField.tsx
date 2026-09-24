import { useState } from "react";
import styled from "styled-components";
import TextField, { TextFieldProps } from "../TextField/TextField";
import { colors } from "../../styles/tokens";
import { Eye, EyeOff } from "lucide-react";
import Icon from "../Icon";

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
                    <Icon icon={visible ? Eye : EyeOff} size="xl" />
                </ToggleButton>
            }
        />
    );
};

export default PasswordField;
