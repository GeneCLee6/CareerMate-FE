import {
    ChangeEvent,
    ClipboardEvent,
    KeyboardEvent,
    useCallback,
    useMemo,
    useRef,
} from "react";
import styled from "styled-components";
import { colors } from "../../styles/tokens";

const Boxes = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
`;

/** Like TextField, the invalid look is driven by `aria-invalid`. */
const Box = styled.input`
    width: 48px;
    height: 56px;
    font-family: inherit;
    font-size: 24px;
    text-align: center;
    color: ${colors.text};
    background-color: #fff;
    border: 1px solid ${colors.border};
    border-radius: 12px;
    outline: none;
    transition: border-color 0.2s ease;

    &:focus {
        border-color: ${colors.borderFocus};
    }

    &[aria-invalid="true"] {
        border-color: ${colors.danger};
    }
`;

export interface OtpInputProps {
    value: string;
    onChange: (next: string) => void;
    length?: number;
    invalid?: boolean;
    disabled?: boolean;
}

/**
 * The split verification-code field. `value` is the whole code; each box edits
 * one character and focus follows typing, deleting and pasting.
 */
const OtpInput = ({
    value,
    onChange,
    length = 6,
    invalid,
    disabled,
}: OtpInputProps) => {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const chars = useMemo(
        () => Array.from({ length }, (_, i) => value[i] ?? ""),
        [value, length]
    );

    const setCharAt = useCallback(
        (index: number, char: string) => {
            const next = Array.from({ length }, (_, i) =>
                i === index ? char : (value[i] ?? "")
            ).join("");
            onChange(next);
        },
        [length, onChange, value]
    );

    const handleChange =
        (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
            const digits = e.target.value.replace(/\D/g, "");
            if (!digits) {
                setCharAt(index, "");
                return;
            }
            // Typing into a filled box, or pasting, spreads across the boxes.
            const merged =
                value.slice(0, index) +
                digits +
                value.slice(index + digits.length);
            onChange(merged.slice(0, length));
            refs.current[Math.min(index + digits.length, length - 1)]?.focus();
        };

    const handleKeyDown =
        (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Backspace" && !chars[index] && index > 0) {
                e.preventDefault();
                setCharAt(index - 1, "");
                refs.current[index - 1]?.focus();
            }
            if (e.key === "ArrowLeft" && index > 0) {
                refs.current[index - 1]?.focus();
            }
            if (e.key === "ArrowRight" && index < length - 1) {
                refs.current[index + 1]?.focus();
            }
        };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        const digits = e.clipboardData.getData("text").replace(/\D/g, "");
        if (!digits) return;
        e.preventDefault();
        onChange(digits.slice(0, length));
        refs.current[Math.min(digits.length, length - 1)]?.focus();
    };

    return (
        <Boxes>
            {chars.map((char, index) => (
                <Box
                    key={index}
                    ref={(el) => {
                        refs.current[index] = el;
                    }}
                    value={char}
                    onChange={handleChange(index)}
                    onKeyDown={handleKeyDown(index)}
                    onPaste={handlePaste}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={length}
                    disabled={disabled}
                    aria-invalid={invalid ? "true" : undefined}
                    aria-label={`Digit ${index + 1} of ${length}`}
                />
            ))}
        </Boxes>
    );
};

export default OtpInput;
