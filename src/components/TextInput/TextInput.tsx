import { ChangeEvent, useEffect, useRef } from "react";
import styled from "styled-components";

const FieldContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
`;

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;

const FieldLabel = styled.label`
    font-size: 0.95rem;
    font-weight: 600;
    color: #334155;
`;

const Input = styled.input`
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 0.7rem;
    padding: 0.75rem 0.9rem;
    font-size: 0.95rem;
    outline: none;
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;

    &:focus {
        border-color: #0284c7;
        box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.16);
    }
`;

const ErrorMessage = styled.p`
    margin: 0;
    font-size: 0.875rem;
    color: #ef4444;
`;

export interface TextInputProps {
    label: string;
    type: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    autoFocus?: boolean;
}

const TextInput = ({
    label,
    type,
    value,
    onChange,
    error,
    autoFocus,
}: TextInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = label?.toLowerCase() ?? "input";

    useEffect(() => {
        if (autoFocus) {
            inputRef.current?.focus();
        }
    }, [autoFocus]);

    return (
        <FieldContainer>
            <FieldGroup>
                <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
                <Input
                    ref={inputRef}
                    type={type}
                    id={inputId}
                    name={inputId}
                    value={value}
                    onChange={onChange}
                />
            </FieldGroup>
            {error && <ErrorMessage>{error}</ErrorMessage>}
        </FieldContainer>
    );
};

export default TextInput;
