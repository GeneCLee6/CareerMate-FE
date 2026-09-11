import { FormEvent, useState } from "react";
import styled from "styled-components";
import TextInput from "../../components/TextInput";
import useEmail from "../../hooks/useEmail";
import usePassword from "../../hooks/usePassword";
import { validateLogin } from "../../utils/validators";
import { useNavigate } from "react-router-dom";
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

const Login = () => {
    const { email, emailError, emailChange } = useEmail();
    const { password, passwordError, passwordChange } = usePassword();

    const [status, setStatus] = useState<RequestStatus>("idle");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    function mockLogin(email: string, password: string): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === "test@test.com" && password === "123456") {
                    resolve();
                } else {
                    reject(new Error("Incorrect email or password"));
                }
            }, 1000);
        });
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const errMsg = validateLogin(email, password);

        if (errMsg) {
            setStatus("error");
            setError(errMsg);
            return;
        }

        try {
            setStatus("loading");
            await mockLogin(email, password);
            setStatus("success");
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
                <PageTitle>Login</PageTitle>
                <AuthForm onSubmit={handleSubmit}>
                    <TextInput
                        label="Email"
                        type="email"
                        value={email}
                        onChange={emailChange}
                        error={emailError}
                        autoFocus
                    />
                    <TextInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={passwordChange}
                        error={passwordError}
                    />
                    <SubmitButton>
                        {status === "loading" ? "Logging in..." : "Login"}
                    </SubmitButton>
                    {status === "error" && (
                        <FeedbackText $status="error">{error}</FeedbackText>
                    )}
                    {status === "success" && (
                        <FeedbackText $status="success">
                            Login Success
                        </FeedbackText>
                    )}
                    <SwitchText>
                        Don't have an account?
                        <SwitchLink onClick={() => navigate("/register")}>
                            Register
                        </SwitchLink>
                    </SwitchText>
                </AuthForm>
            </AuthCard>
        </AuthPage>
    );
};

export default Login;
