import { FormEvent, Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import GradientButton from "../../components/GradientButton";
import SelectField from "../../components/SelectField";
import AlertBanner from "../../components/AlertBanner";
import ArrowIcon from "../../components/ArrowIcon";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import { updateProfile } from "../../api/users";
import { colors, fontFamily } from "../../styles/tokens";
import logoIcon from "../../assets/logo-icon.png";
import logoText from "../../assets/logo-text.png";
import {
    FIELD_OPTIONS,
    GOAL_OPTIONS,
    ROLE_OPTIONS,
    ONBOARDING_STEPS,
} from "./options";
import { toUserField, toUserRole } from "../../utils/profileOptions";

const Page = styled.div`
    display: grid;
    grid-template-columns: 320px 1fr;
    min-height: 100vh;
    font-family: ${fontFamily};
    color: ${colors.text};
    background-color: #fff;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const Rail = styled.aside`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 32px;
    background-color: #f9fafc;

    @media (max-width: 900px) {
        justify-content: flex-start;
        gap: 32px;
    }
`;

const Logo = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
`;

const LogoIcon = styled.img`
    height: 24px;
    width: auto;
`;

const LogoText = styled.img`
    height: 18px;
    width: auto;
`;

const Steps = styled.ol`
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 0 0 24px;
    padding: 0;
    list-style: none;
`;

const StepRow = styled.li`
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 48px;
`;

const Bullet = styled.span<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background-color: ${({ $active }) => ($active ? "#2f6bff" : "#d4d6dd")};
    border-radius: 50%;
`;

const StepLabel = styled.span<{ $active: boolean }>`
    font-size: 14px;
    color: ${({ $active }) => ($active ? "#2f6bff" : colors.placeholder)};
`;

/** The hairline joining consecutive bullets. */
const Connector = styled.li`
    width: 1px;
    height: 20px;
    margin-left: 11px;
    background-color: #d4d6dd;
`;

const Main = styled.main`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 32px;
`;

const Centered = styled.div`
    width: 100%;
    max-width: 440px;
    text-align: center;
`;

const Title = styled.h1`
    margin: 0 0 10px;
    font-size: 40px;
    font-weight: 400;
    line-height: 1.2;
    color: ${colors.text};
`;

const Subtitle = styled.p`
    margin: 0 0 48px;
    font-size: 15px;
    color: ${colors.label};
`;

const FormTitle = styled.h1`
    margin: 0 0 40px;
    font-size: 22px;
    font-weight: 400;
    color: ${colors.text};
    text-align: left;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 24px;
    text-align: left;
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
`;

const BackButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    padding: 0 24px;
    font-family: inherit;
    font-size: 14px;
    color: ${colors.text};
    background-color: #fff;
    border: 1px solid ${colors.border};
    border-radius: 22px;
    cursor: pointer;

    &:hover {
        background-color: #fafafa;
    }
`;

const NextButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    padding: 0 28px;
    font-family: inherit;
    font-size: 14px;
    color: #fff;
    background-color: #161616;
    border: none;
    border-radius: 22px;
    cursor: pointer;

    &:hover:not(:disabled) {
        background-color: #333;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const InlineButton = styled(GradientButton)`
    width: auto;
    min-width: 200px;
    margin: 0 auto;
`;

const BannerSlot = styled.div`
    margin-bottom: 24px;
    text-align: left;
`;

const Onboarding = () => {
    const [stepIndex, setStepIndex] = useState(0);
    const [role, setRole] = useState("");
    const [field, setField] = useState("");
    const [goal, setGoal] = useState("");
    const [banner, setBanner] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    async function handleSubmitBasics(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!role || !field || !goal) {
            setBanner("Please complete every field before continuing.");
            return;
        }

        setBanner(null);
        setSaving(true);

        try {
            const updated = await updateProfile({
                // fullName is required by the API, so send the current one back.
                fullName: user?.fullName ?? "",
                role: toUserRole(role),
                field: toUserField(field),
                goal,
            });
            updateUser(updated);
            setStepIndex(2);
        } catch (err) {
            if (err instanceof ApiError) {
                setBanner(
                    err.isNetworkError ? `\u{1F50C} ${err.message}` : err.message
                );
            } else {
                setBanner("Something went wrong. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <Page>
            <Rail>
                <Logo to="/" aria-label="CareerMate AI home">
                    <LogoIcon src={logoIcon} alt="" />
                    <LogoText src={logoText} alt="CareerMate AI" />
                </Logo>
                <Steps>
                    {ONBOARDING_STEPS.map((label, index) => (
                        <Fragment key={label}>
                            {index > 0 && <Connector aria-hidden="true" />}
                            <StepRow
                                aria-current={
                                    index === stepIndex ? "step" : undefined
                                }
                            >
                                <Bullet $active={index <= stepIndex}>
                                    {index + 1}
                                </Bullet>
                                <StepLabel $active={index <= stepIndex}>
                                    {label}
                                </StepLabel>
                            </StepRow>
                        </Fragment>
                    ))}
                </Steps>
            </Rail>

            <Main>
                {stepIndex === 0 && (
                    <Centered>
                        <Title>Welcome to CareerMate AI !</Title>
                        <Subtitle>
                            Let AI guide your job preparation and growth.
                        </Subtitle>
                        <InlineButton
                            type="button"
                            onClick={() => setStepIndex(1)}
                        >
                            Start Setup
                            <ArrowIcon size={18} />
                        </InlineButton>
                    </Centered>
                )}

                {stepIndex === 1 && (
                    <Centered>
                        <FormTitle>Basic Information</FormTitle>
                        {banner && (
                            <BannerSlot>
                                <AlertBanner>{banner}</AlertBanner>
                            </BannerSlot>
                        )}
                        <Form onSubmit={handleSubmitBasics} noValidate>
                            <SelectField
                                id="role"
                                label="Your Role"
                                options={ROLE_OPTIONS}
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            <SelectField
                                id="field"
                                label="Your Field"
                                options={FIELD_OPTIONS}
                                value={field}
                                onChange={(e) => setField(e.target.value)}
                            />
                            <SelectField
                                id="goal"
                                label="Your Goal"
                                options={GOAL_OPTIONS}
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                            />
                            <Actions>
                                <BackButton
                                    type="button"
                                    onClick={() => setStepIndex(0)}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M16 10H4M4 10l6-6M4 10l6 6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    Back
                                </BackButton>
                                <NextButton type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Next"}
                                    <ArrowIcon size={16} />
                                </NextButton>
                            </Actions>
                        </Form>
                    </Centered>
                )}

                {stepIndex === 2 && (
                    <Centered>
                        <Title>Setup Complete !</Title>
                        <Subtitle>
                            You&apos;re all set to start your AI career journey.
                        </Subtitle>
                        <InlineButton
                            type="button"
                            onClick={() => navigate("/app", { replace: true })}
                        >
                            Go to Dashboard
                            <ArrowIcon size={18} />
                        </InlineButton>
                    </Centered>
                )}
            </Main>
        </Page>
    );
};

export default Onboarding;
