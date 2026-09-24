import { FormEvent, ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import AuthLayout from "../../components/AuthLayout";
import { ArrowLeft, ArrowRight, KeyRound, Lock, Mail } from "lucide-react";
import Icon from "../../components/Icon";
import TextField from "../../components/TextField";
import PasswordField from "../../components/PasswordField";
import GradientButton from "../../components/GradientButton";
import AlertBanner from "../../components/AlertBanner";
import OtpInput from "../../components/OtpInput";
import SuccessMessage from "../../components/SuccessMessage";
import { ApiError } from "../../api/client";
import * as authApi from "../../api/auth";
import {
    maskEmail,
    validateEmail,
    validatePassword,
} from "../../utils/validators";
import { colors, gradient } from "../../styles/tokens";

const CODE_LENGTH = 6;

const Centered = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
`;

const IconBadge = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin-bottom: 20px;
    color: ${colors.text};
    background-color: #fff;
    border: 1px solid ${colors.border};
    border-radius: 12px;
`;

const Title = styled.h1`
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 400;
    color: ${colors.text};
`;

const Subtitle = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: ${colors.textMuted};
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    margin-top: 40px;
    text-align: left;
`;

const BannerSlot = styled.div`
    width: 100%;
    margin-top: 16px;
`;

const Footer = styled.p`
    margin: 0;
    text-align: center;
    font-size: 14px;
    color: ${colors.textMuted};
`;

const LinkButton = styled.button`
    padding: 0;
    font: inherit;
    font-weight: 500;
    color: ${colors.link};
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }

    &:disabled {
        color: ${colors.placeholder};
        cursor: not-allowed;
    }
`;

const BackButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 20px;
    font-family: inherit;
    font-size: 14px;
    color: ${colors.text};
    background-color: #fff;
    border: 1px solid ${colors.border};
    border-radius: 20px;
    cursor: pointer;

    &:hover {
        background-color: #fafafa;
    }
`;

const GoToLogin = styled(Link)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 44px;
    padding: 0 32px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    background: ${gradient};
    border-radius: 22px;
    text-decoration: none;
`;

type Step = "email" | "code" | "password" | "done";

const ForgotPassword = () => {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [banner, setBanner] = useState<string | null>(null);
    const [invalidFields, setInvalidFields] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    /** Maps a thrown error onto the design's banner, network case included. */
    function reportError(err: unknown) {
        if (err instanceof ApiError) {
            setBanner(
                err.isNetworkError ? `\u{1F50C} ${err.message}` : err.message
            );
        } else {
            setBanner("Something went wrong. Please try again.");
        }
    }

    async function handleSendCode(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const emailError = validateEmail(email);
        if (emailError) {
            setBanner(emailError);
            setInvalidFields(["email"]);
            return;
        }

        setBanner(null);
        setInvalidFields([]);
        setSubmitting(true);

        try {
            await authApi.forgotPassword(email.trim());
            setStep("code");
            setCode("");
        } catch (err) {
            reportError(err);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleVerifyCode(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (code.length !== CODE_LENGTH) {
            setBanner(`Please enter the ${CODE_LENGTH}-digit code.`);
            setInvalidFields(["code"]);
            return;
        }

        setBanner(null);
        setInvalidFields([]);
        setSubmitting(true);

        try {
            const token = await authApi.verifyCode(email.trim(), code);
            setResetToken(token);
            setStep("password");
        } catch (err) {
            setInvalidFields(["code"]);
            reportError(err);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleResend() {
        setBanner(null);
        setSubmitting(true);
        try {
            await authApi.forgotPassword(email.trim());
            setCode("");
        } catch (err) {
            reportError(err);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleResetPassword(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const passwordError = validatePassword(password);
        if (passwordError) {
            setBanner(passwordError);
            setInvalidFields(["password"]);
            return;
        }
        if (password !== confirmPassword) {
            setBanner("Passwords do not match.");
            setInvalidFields(["confirmPassword"]);
            return;
        }

        setBanner(null);
        setInvalidFields([]);
        setSubmitting(true);

        try {
            await authApi.resetPassword({
                email: email.trim(),
                resetToken,
                newPassword: password,
            });
            setStep("done");
        } catch (err) {
            reportError(err);
        } finally {
            setSubmitting(false);
        }
    }

    const back = () => {
        setBanner(null);
        setInvalidFields([]);
        if (step === "email") navigate("/login");
        else if (step === "code") setStep("email");
        else if (step === "password") setStep("code");
    };

    const bannerSlot = banner ? (
        <BannerSlot>
            <AlertBanner>{banner}</AlertBanner>
        </BannerSlot>
    ) : null;

    const shell = (children: ReactNode) => (
        <AuthLayout
            showPanel={false}
            headerAction={
                step === "done" ? undefined : (
                    <BackButton type="button" onClick={back}>
                        <Icon icon={ArrowLeft} size="md" />
                        Back
                    </BackButton>
                )
            }
        >
            <Centered>{children}</Centered>
        </AuthLayout>
    );

    if (step === "done") {
        return shell(
            <SuccessMessage message="🎉 Reset password successful!">
                <GoToLogin to="/login">
                    Go to login
                    <Icon icon={ArrowRight} size="lg" />
                </GoToLogin>
            </SuccessMessage>
        );
    }

    if (step === "code") {
        return shell(
            <>
                <IconBadge>
                    <Icon icon={Mail} size="xl" />
                </IconBadge>
                <Title>Check your email</Title>
                <Subtitle>
                    Input the code that was sent to {maskEmail(email.trim())}
                </Subtitle>
                {bannerSlot}
                <Form onSubmit={handleVerifyCode} noValidate>
                    <OtpInput
                        value={code}
                        onChange={setCode}
                        length={CODE_LENGTH}
                        invalid={invalidFields.includes("code")}
                        disabled={submitting}
                    />
                    <GradientButton type="submit" disabled={submitting}>
                        {submitting ? "Checking..." : "Next"}
                    </GradientButton>
                    <Footer>
                        Didn&apos;t get any code?{" "}
                        <LinkButton
                            type="button"
                            onClick={handleResend}
                            disabled={submitting}
                        >
                            Click to resend
                        </LinkButton>
                    </Footer>
                </Form>
            </>
        );
    }

    if (step === "password") {
        return shell(
            <>
                <IconBadge>
                    <Icon icon={Lock} size="xl" />
                </IconBadge>
                <Title>Set a new password</Title>
                <Subtitle>
                    Your new password must be different from previously used
                    passwords.
                    <br />
                    At least 8 characters, include letters and numbers
                </Subtitle>
                {bannerSlot}
                <Form onSubmit={handleResetPassword} noValidate>
                    <PasswordField
                        id="new-password"
                        name="newPassword"
                        label="Password"
                        placeholder="Create a password"
                        autoComplete="new-password"
                        value={password}
                        invalid={invalidFields.includes("password")}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <PasswordField
                        id="confirm-password"
                        name="confirmPassword"
                        label="Confirm Password"
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        invalid={invalidFields.includes("confirmPassword")}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <GradientButton type="submit" disabled={submitting}>
                        {submitting ? "Resetting..." : "Reset password"}
                    </GradientButton>
                </Form>
            </>
        );
    }

    return shell(
        <>
            <IconBadge>
                <Icon icon={KeyRound} size="xl" />
            </IconBadge>
            <Title>Forgot your password?</Title>
            <Subtitle>
                Fill in your email and we&apos;ll send you a link to reset your
                password.
            </Subtitle>
            {bannerSlot}
            <Form onSubmit={handleSendCode} noValidate>
                <TextField
                    id="reset-email"
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="Your email"
                    autoComplete="email"
                    value={email}
                    invalid={invalidFields.includes("email")}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <GradientButton type="submit" disabled={submitting}>
                    {submitting ? "Sending..." : "Send"}
                </GradientButton>
            </Form>
        </>
    );
};

export default ForgotPassword;
