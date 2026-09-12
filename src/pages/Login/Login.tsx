import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import AuthLayout from "../../components/AuthLayout";
import TextField from "../../components/TextField";
import PasswordField from "../../components/PasswordField";
import GradientButton from "../../components/GradientButton";
import AlertBanner from "../../components/AlertBanner";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import * as authApi from "../../api/auth";
import type { VerifyEmailState } from "../VerifyEmail";
import {
    FieldErrors,
    LoginFormValues,
    validateLoginForm,
} from "../../utils/validators";
import { colors } from "../../styles/tokens";

const Title = styled.h1`
    margin: 0 0 8px;
    font-size: 40px;
    font-weight: 400;
    line-height: 1.2;
    color: ${colors.text};
`;

const Subtitle = styled.p`
    margin: 0;
    font-size: 15px;
    color: ${colors.textMuted};
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 40px;
`;

const BannerSlot = styled.div`
    margin-top: 16px;
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: -4px;
`;

const Remember = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: ${colors.text};
    cursor: pointer;
`;

const Checkbox = styled.input`
    width: 18px;
    height: 18px;
    accent-color: #2f6bff;
    cursor: pointer;
`;

const Footer = styled.p`
    margin: 0;
    text-align: center;
    font-size: 14px;
    color: ${colors.textMuted};
`;

const TextLink = styled(Link)`
    color: ${colors.link};
    text-decoration: none;
    font-weight: 500;

    &:hover {
        text-decoration: underline;
    }
`;

const Login = () => {
    const [values, setValues] = useState<LoginFormValues>({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<FieldErrors<LoginFormValues>>({});
    const [banner, setBanner] = useState<string | null>(null);
    const [remember, setRemember] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    /** A rejected sign-in marks both fields without blaming either one. */
    const [credentialsRejected, setCredentialsRejected] = useState(false);

    const { signIn } = useAuth();
    const showToast = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // Set by ProtectedRoute when it bounced the user here.
    const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from
            ?.pathname ?? "/app";

    const setValue = (key: keyof LoginFormValues, value: string) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const nextErrors = validateLoginForm(values);
        setErrors(nextErrors);

        const firstError = Object.values(nextErrors)[0];
        if (firstError) {
            setBanner(firstError);
            return;
        }

        setBanner(null);
        setCredentialsRejected(false);
        setSubmitting(true);

        try {
            const session = await authApi.login({
                email: values.email.trim(),
                password: values.password,
            });

            showToast("Logged in successfully. Redirecting...");
            signIn(session, remember);
            window.setTimeout(
                () => navigate(redirectTo, { replace: true }),
                900
            );
        } catch (err) {
            if (err instanceof ApiError && err.isNetworkError) {
                setBanner(`\u{1F50C} ${err.message}`);
            } else if (err instanceof ApiError && err.status === 403) {
                // The password was right but the account was never verified.
                // Send them to the code screen rather than to a dead end.
                navigate("/verify-email", {
                    state: {
                        email: values.email.trim(),
                        notice: err.message,
                    } satisfies VerifyEmailState,
                });
                return;
            } else if (err instanceof ApiError && err.status === 401) {
                // Don't echo which half was wrong — the design shows one message.
                setBanner("Invalid email or password. Please try again.");
                setCredentialsRejected(true);
            } else if (err instanceof ApiError) {
                setBanner(err.message);
            } else {
                setBanner("Something went wrong. Please try again.");
            }
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <Title>Welcome Back</Title>
            <Subtitle>Log in to continue your AI journey</Subtitle>

            {banner && (
                <BannerSlot>
                    <AlertBanner>{banner}</AlertBanner>
                </BannerSlot>
            )}

            <Form onSubmit={handleSubmit} noValidate>
                <TextField
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="Your email"
                    autoComplete="email"
                    value={values.email}
                    invalid={Boolean(errors.email) || credentialsRejected}
                    onChange={(e) => setValue("email", e.target.value)}
                />
                <PasswordField
                    id="password"
                    name="password"
                    label="Password"
                    placeholder="Your password"
                    autoComplete="current-password"
                    value={values.password}
                    invalid={Boolean(errors.password) || credentialsRejected}
                    onChange={(e) => setValue("password", e.target.value)}
                />

                <Row>
                    <Remember>
                        <Checkbox
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        Remember Me
                    </Remember>
                    <TextLink to="/forgot-password">Forgot Password?</TextLink>
                </Row>

                <GradientButton type="submit" disabled={submitting}>
                    {submitting ? "Logging in..." : "Log In"}
                </GradientButton>

                <Footer>
                    Don&apos;t have an account?{" "}
                    <TextLink to="/register">Sign up</TextLink>
                </Footer>
            </Form>
        </AuthLayout>
    );
};

export default Login;
