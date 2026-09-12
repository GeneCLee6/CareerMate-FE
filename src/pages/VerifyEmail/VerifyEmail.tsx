import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import AuthLayout from "../../components/AuthLayout";
import GradientButton from "../../components/GradientButton";
import AlertBanner from "../../components/AlertBanner";
import OtpInput from "../../components/OtpInput";
import SuccessMessage from "../../components/SuccessMessage";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import * as authApi from "../../api/auth";
import { maskEmail } from "../../utils/validators";
import { colors } from "../../styles/tokens";

const CODE_LENGTH = 6;

/** Matches the backend's RESEND_COOLDOWN_MS, so the button re-enables with it. */
const RESEND_COOLDOWN_SECONDS = 60;

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

const MailIcon = () => (
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
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
    </svg>
);

const BackArrow = () => (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
            d="M16 10H4M4 10l6-6M4 10l6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/** Set by Register and by Login when it meets an unverified account. */
export interface VerifyEmailState {
    email?: string;
    /** Shown above the form, e.g. why Login sent the user here. */
    notice?: string;
    /**
     * True when the previous screen already triggered a send. Register did;
     * a refused login did not, and that user needs a code straight away.
     */
    codeSent?: boolean;
}

const VerifyEmail = () => {
    const location = useLocation();
    const state = (location.state as VerifyEmailState | null) ?? {};
    const email = state.email?.trim() ?? "";

    const [code, setCode] = useState("");
    const [banner, setBanner] = useState<string | null>(state.notice ?? null);
    const [codeRejected, setCodeRejected] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [cooldown, setCooldown] = useState(
        state.codeSent ? RESEND_COOLDOWN_SECONDS : 0
    );

    const { signIn } = useAuth();
    const navigate = useNavigate();
    const redirectTimer = useRef<number | undefined>(undefined);

    // When a code has just been sent, count down instead of offering a resend
    // the backend would refuse inside its own cooldown.
    useEffect(() => {
        if (cooldown <= 0) return undefined;
        const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => window.clearTimeout(id);
    }, [cooldown]);

    useEffect(
        () => () => {
            if (redirectTimer.current) {
                window.clearTimeout(redirectTimer.current);
            }
        },
        []
    );

    const reportError = useCallback((err: unknown) => {
        if (err instanceof ApiError) {
            setBanner(err.isNetworkError ? `\u{1F50C} ${err.message}` : err.message);
        } else {
            setBanner("Something went wrong. Please try again.");
        }
    }, []);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (code.length !== CODE_LENGTH) {
            setBanner(`Please enter the ${CODE_LENGTH}-digit code.`);
            setCodeRejected(true);
            return;
        }

        setBanner(null);
        setCodeRejected(false);
        setSubmitting(true);

        try {
            const session = await authApi.verifyEmail(email, code);
            setSucceeded(true);
            // Same beat as Register used to take before moving on.
            redirectTimer.current = window.setTimeout(() => {
                signIn(session, true);
                navigate("/onboarding", { replace: true });
            }, 1200);
        } catch (err) {
            setCodeRejected(true);
            setCode("");
            reportError(err);
            setSubmitting(false);
        }
    }

    async function handleResend() {
        setBanner(null);
        setCodeRejected(false);
        setSubmitting(true);

        try {
            await authApi.resendVerification(email);
            setCode("");
            setCooldown(RESEND_COOLDOWN_SECONDS);
            setBanner("A new code is on its way.");
        } catch (err) {
            reportError(err);
        } finally {
            setSubmitting(false);
        }
    }

    // A refresh loses the router state, and the code was sent to an address we
    // no longer know. Registering again is the only way back into the flow.
    if (!email) {
        return <Navigate to="/register" replace />;
    }

    if (succeeded) {
        return (
            <AuthLayout showPanel={false}>
                <SuccessMessage message="🎉 Email verified! Logging you in..." />
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            showPanel={false}
            headerAction={
                <BackButton type="button" onClick={() => navigate("/register")}>
                    <BackArrow />
                    Back
                </BackButton>
            }
        >
            <Centered>
                <IconBadge>
                    <MailIcon />
                </IconBadge>
                <Title>Verify your email</Title>
                <Subtitle>
                    Input the code that was sent to {maskEmail(email)}
                </Subtitle>

                {banner && (
                    <BannerSlot>
                        <AlertBanner>{banner}</AlertBanner>
                    </BannerSlot>
                )}

                <Form onSubmit={handleSubmit} noValidate>
                    <OtpInput
                        value={code}
                        onChange={setCode}
                        length={CODE_LENGTH}
                        invalid={codeRejected}
                        disabled={submitting}
                    />
                    <GradientButton type="submit" disabled={submitting}>
                        {submitting ? "Checking..." : "Verify"}
                    </GradientButton>
                    <Footer>
                        Didn&apos;t get any code?{" "}
                        <LinkButton
                            type="button"
                            onClick={handleResend}
                            disabled={submitting || cooldown > 0}
                        >
                            {cooldown > 0
                                ? `Resend in ${cooldown}s`
                                : "Resend code"}
                        </LinkButton>
                    </Footer>
                </Form>
            </Centered>
        </AuthLayout>
    );
};

export default VerifyEmail;
