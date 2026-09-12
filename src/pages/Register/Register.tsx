import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import AuthLayout from "../../components/AuthLayout";
import TextField from "../../components/TextField";
import PasswordField from "../../components/PasswordField";
import GradientButton from "../../components/GradientButton";
import AlertBanner from "../../components/AlertBanner";
import Modal from "../../components/Modal";
import SuccessMessage from "../../components/SuccessMessage";
import { ApiError } from "../../api/client";
import * as authApi from "../../api/auth";
import type { VerifyEmailState } from "../VerifyEmail";
import {
    FieldErrors,
    RegisterFormValues,
    validateRegisterForm,
} from "../../utils/validators";
import { LIMITS } from "../../utils/limits";
import { colors, gradient } from "../../styles/tokens";

const Title = styled.h1`
    margin: 0 0 8px;
    font-size: 40px;
    font-weight: 900;
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

const WarningIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin: 0 auto 16px;
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    background-color: ${colors.warning};
    border-radius: 50%;
`;

const ModalText = styled.p`
    margin: 0 0 24px;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.4;
    color: ${colors.text};
`;

const ModalButton = styled(Link)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    padding: 0 28px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    background: ${gradient};
    border-radius: 20px;
    text-decoration: none;
`;

const EMPTY: RegisterFormValues = { fullName: "", email: "", password: "" };

const Register = () => {
    const [values, setValues] = useState<RegisterFormValues>(EMPTY);
    const [errors, setErrors] = useState<FieldErrors<RegisterFormValues>>({});
    const [banner, setBanner] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    /** The design shows a dedicated modal for an already-registered email. */
    const [emailTaken, setEmailTaken] = useState(false);

    const navigate = useNavigate();

    const setValue = (key: keyof RegisterFormValues, value: string) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const nextErrors = validateRegisterForm(values);
        setErrors(nextErrors);

        const firstError = Object.values(nextErrors)[0];
        if (firstError) {
            setBanner(firstError);
            return;
        }

        setBanner(null);
        setSubmitting(true);

        try {
            const registeredEmail = await authApi.register({
                fullName: values.fullName.trim(),
                email: values.email.trim(),
                password: values.password,
            });

            setSucceeded(true);
            // The account exists but cannot be used until the emailed code is
            // entered, so the next stop is the code screen, not onboarding.
            window.setTimeout(() => {
                navigate("/verify-email", {
                    replace: true,
                    state: {
                        email: registeredEmail,
                        codeSent: true,
                    } satisfies VerifyEmailState,
                });
            }, 1200);
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setEmailTaken(true);
            } else if (err instanceof ApiError) {
                setBanner(
                    err.isNetworkError ? `\u{1F50C} ${err.message}` : err.message
                );
            } else {
                setBanner("Something went wrong. Please try again.");
            }
            setSubmitting(false);
        }
    }

    if (succeeded) {
        return (
            <AuthLayout showPanel={false}>
                <SuccessMessage message="🎉 Registration successful! Sending you a code..." />
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <Title>Create Your Account</Title>
            <Subtitle>
                Join CareerMate AI and start your smart career journey
            </Subtitle>

            {banner && (
                <BannerSlot>
                    <AlertBanner>{banner}</AlertBanner>
                </BannerSlot>
            )}

            <Form onSubmit={handleSubmit} noValidate>
                <TextField
                    id="fullName"
                    name="fullName"
                    label="Full Name"
                    placeholder="Your full name"
                    autoComplete="name"
                    maxLength={LIMITS.FULL_NAME}
                    value={values.fullName}
                    invalid={Boolean(errors.fullName)}
                    onChange={(e) => setValue("fullName", e.target.value)}
                />
                <TextField
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="Your email"
                    autoComplete="email"
                    maxLength={LIMITS.EMAIL}
                    value={values.email}
                    invalid={Boolean(errors.email)}
                    onChange={(e) => setValue("email", e.target.value)}
                />
                <PasswordField
                    id="password"
                    name="password"
                    label="Password"
                    placeholder="Create a password"
                    autoComplete="new-password"
                    value={values.password}
                    invalid={Boolean(errors.password)}
                    onChange={(e) => setValue("password", e.target.value)}
                />

                <GradientButton type="submit" disabled={submitting}>
                    {submitting ? "Creating account..." : "Create Account"}
                </GradientButton>

                <Footer>
                    Already have an account?{" "}
                    <TextLink to="/login">Log in</TextLink>
                </Footer>
            </Form>

            {emailTaken && (
                <Modal
                    onClose={() => setEmailTaken(false)}
                    labelledBy="email-taken"
                >
                    <WarningIcon aria-hidden="true">!</WarningIcon>
                    <ModalText id="email-taken">
                        Email already registered,
                        <br />
                        please log in instead
                    </ModalText>
                    <ModalButton to="/login">Go to login</ModalButton>
                </Modal>
            )}
        </AuthLayout>
    );
};

export default Register;
