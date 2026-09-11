import { ChangeEvent, FormEvent, useState } from "react";
import styled from "styled-components";
import TextInput from "../../components/TextInput";
import useEmail from "../../hooks/useEmail";
import usePassword from "../../hooks/usePassword";
import { useNavigate } from "react-router-dom";
import { validateRegister } from "../../utils/validators";
import { RequestStatus } from "../../types";

const AuthPage = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1rem;
    background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #ecfeff 100%);
`;

const AuthCard = styled.div`
    width: 100%;
    max-width: 28rem;
    padding: 2rem;
    border: 1px solid #e2e8f0;
    border-radius: 1.25rem;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
    backdrop-filter: blur(10px);
`;

const PageTitle = styled.h1`
    margin-bottom: 1.5rem;
    text-align: center;
    font-size: 1.875rem;
    font-weight: 600;
    color: #0f172a;
`;

const AuthForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const SubmitButton = styled.button`
    width: 100%;
    border: none;
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    background: #0284c7;
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: #0369a1;
    }
`;

const FeedbackText = styled.p<{ $status: RequestStatus }>`
    font-size: 0.875rem;
    color: ${({ $status }) => ($status === "error" ? "#ef4444" : "#16a34a")};
`;

const SwitchText = styled.p`
    padding-top: 0.5rem;
    text-align: center;
    font-size: 0.875rem;
    color: #475569;
`;

const SwitchLink = styled.span`
    margin-left: 0.25rem;
    font-weight: 600;
    color: #0284c7;
    cursor: pointer;

    &:hover {
        color: #0369a1;
    }
`;

const Register = () => {
    const { email, emailError, emailChange } = useEmail();
    const { password, passwordError, passwordChange } = usePassword();

    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const [status, setStatus] = useState<RequestStatus>("idle");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    function mockRegister(
        name: string,
        email: string,
        password: string
    ): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    function nameChange(e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setName(value);
        if (!value.trim()) {
            setNameError("Name is required");
        } else {
            setNameError("");
        }
    }

    function confirmPasswordChange(e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setConfirmPassword(value);
        if (!value.trim()) {
            setConfirmPasswordError("Please confirm your password");
        } else if (value !== password) {
            setConfirmPasswordError("Passwords do not match");
        } else {
            setConfirmPasswordError("");
        }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const errMsg = validateRegister(name, email, password, confirmPassword);
        if (errMsg) {
            setStatus("error");
            setError(errMsg);
            return;
        }
        try {
            setStatus("loading");

            await mockRegister(name, email, password);
            setStatus("success");
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (err) {
            setStatus("error");
            setError(
                err instanceof Error ? err.message : "Something went wrong"
            );
        }
    }

    return (
        <AuthPage>
            <AuthCard>
                <PageTitle>CareerMate Register</PageTitle>
                <AuthForm onSubmit={handleSubmit}>
                    <TextInput
                        label="Name"
                        type="text"
                        value={name}
                        onChange={nameChange}
                        error={nameError}
                        autoFocus
                    />
                    <TextInput
                        label="Email"
                        type="email"
                        value={email}
                        onChange={emailChange}
                        error={emailError}
                    />
                    <TextInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={passwordChange}
                        error={passwordError}
                    />
                    <TextInput
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={confirmPasswordChange}
                        error={confirmPasswordError}
                    />
                    <SubmitButton>
                        {status === "loading" ? "Registering..." : "Register"}
                    </SubmitButton>
                    {status === "error" && (
                        <FeedbackText $status="error">{error}</FeedbackText>
                    )}
                    {status === "success" && (
                        <FeedbackText $status="success">
                            Register Success
                        </FeedbackText>
                    )}
                    <SwitchText>
                        Already have an account?
                        <SwitchLink onClick={() => navigate("/login")}>
                            Login
                        </SwitchLink>
                    </SwitchText>
                </AuthForm>
            </AuthCard>
        </AuthPage>
    );
};

export default Register;
