import { ChangeEvent, ComponentType, useRef, useState } from "react";
import styled from "styled-components";
import AppHeader from "../../components/AppHeader";
import Avatar from "../../components/Avatar";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import { uploadFile } from "../../api/resumes";
import { updateAvatar } from "../../api/users";
import BasicInfoPanel from "./BasicInfoPanel";
import CareerPanel from "./CareerPanel";
import SecurityPanel from "./SecurityPanel";
import ChatHistoryPanel from "./ChatHistoryPanel";
import { FIELD_OPTIONS } from "../Onboarding/options";
import { colors, fontFamily } from "../../styles/tokens";
import { AVATAR_ACCEPT, validateAvatarFile } from "../../utils/fileValidation";

const Page = styled.div`
    min-height: 100vh;
    font-family: ${fontFamily};
    color: ${colors.text};
    background-color: #fff;
`;

const Content = styled.main`
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 32px 80px;
`;

const Title = styled.h1`
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 400;
    color: ${colors.text};
`;

const Subtitle = styled.p`
    margin: 0 0 28px;
    font-size: 14px;
    color: ${colors.label};
`;

const ProfileCard = styled.section`
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px 28px;
    border: 1px solid #eceef2;
    border-radius: 16px;
`;

const AvatarButton = styled.button`
    position: relative;
    padding: 0;
    background: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;

    &:disabled {
        cursor: wait;
        opacity: 0.7;
    }
`;

/** Small camera chip on the avatar, matching the design. */
const CameraChip = styled.span`
    position: absolute;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: #fff;
    background-color: #161616;
    border: 2px solid #fff;
    border-radius: 50%;
`;

const Identity = styled.div`
    flex: 1;
    min-width: 0;
`;

const NameRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
`;

const Name = styled.p`
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: ${colors.text};
`;

const EmailChip = styled.span`
    padding: 4px 10px;
    font-size: 12px;
    color: ${colors.label};
    background-color: #eef0f5;
    border-radius: 6px;
`;

const Meta = styled.p`
    margin: 6px 0 0;
    font-size: 14px;
    color: ${colors.label};
`;

const UploadButton = styled.button`
    height: 40px;
    padding: 0 22px;
    font-family: inherit;
    font-size: 14px;
    color: ${colors.text};
    background-color: #eef0f5;
    border: none;
    border-radius: 20px;
    cursor: pointer;

    &:hover:not(:disabled) {
        background-color: #e4e7ee;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const Body = styled.div`
    display: grid;
    grid-template-columns: 235px 1fr;
    gap: 32px;
    margin-top: 32px;

    @media (max-width: 800px) {
        grid-template-columns: 1fr;
    }
`;

const Tabs = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Tab = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    font-family: inherit;
    font-size: 14px;
    text-align: left;
    color: ${({ $active }) => ($active ? "#2f6bff" : colors.label)};
    background-color: ${({ $active }) => ($active ? "#f9fafc" : "transparent")};
    border: none;
    border-radius: 10px;
    cursor: pointer;

    &:hover {
        background-color: #f9fafc;
    }
`;

const TABS = [
    { id: "basic", label: "Basic Info" },
    { id: "career", label: "Career & Learning" },
    { id: "security", label: "Account & Security" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const PersonIcon = () => (
    <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
);

const BriefcaseIcon = () => (
    <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
);

const LockIcon = () => (
    <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
);

const TAB_ICONS: Record<TabId, ComponentType> = {
    basic: PersonIcon,
    career: BriefcaseIcon,
    security: LockIcon,
};

const CameraIcon = () => (
    <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M3 8h3l2-2h8l2 2h3v12H3z" />
        <circle cx="12" cy="13" r="3.5" />
    </svg>
);

const Settings = () => {
    const [tab, setTab] = useState<TabId>("basic");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user, updateUser } = useAuth();
    const showToast = useToast();

    if (!user) return null;

    const fieldLabel =
        FIELD_OPTIONS.find((option) => option.value === user.field)?.label ?? "";
    const meta = [fieldLabel, user.goal].filter(Boolean).join(" · ");

    async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        // Allow picking the same file again after a failure.
        e.target.value = "";
        if (!file) return;

        // Reject what the server would reject, before spending the upload.
        const problem = validateAvatarFile(file);
        if (problem) {
            showToast(problem, 5000);
            return;
        }

        setUploading(true);
        try {
            const fileKey = await uploadFile(file, "avatar");
            const updated = await updateAvatar(fileKey);
            updateUser(updated);
            showToast("Profile photo updated");
        } catch (err) {
            showToast(
                err instanceof ApiError
                    ? err.message
                    : "Upload failed. Please try again.",
                5000
            );
        } finally {
            setUploading(false);
        }
    }

    const ActivePanel =
        tab === "basic"
            ? BasicInfoPanel
            : tab === "career"
              ? CareerPanel
              : SecurityPanel;

    return (
        <Page>
            <AppHeader />
            <Content>
                <Title>Personal Settings</Title>
                <Subtitle>
                    Update your basic info, career focus and account security.
                </Subtitle>

                <ProfileCard>
                    <AvatarButton
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        aria-label="Change profile photo"
                    >
                        <Avatar
                            name={user.fullName}
                            src={user.avatarUrl}
                            size={62}
                        />
                        <CameraChip aria-hidden="true">
                            <CameraIcon />
                        </CameraChip>
                    </AvatarButton>

                    <Identity>
                        <NameRow>
                            <Name>{user.displayName || user.fullName}</Name>
                            <EmailChip>{user.email}</EmailChip>
                        </NameRow>
                        {meta && <Meta>{meta}</Meta>}
                    </Identity>

                    <UploadButton
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? "Uploading..." : "Upload Now"}
                    </UploadButton>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={AVATAR_ACCEPT}
                        hidden
                        onChange={handleAvatarChange}
                    />
                </ProfileCard>

                <Body>
                    <Tabs aria-label="Settings sections">
                        {TABS.map(({ id, label }) => {
                            const Icon = TAB_ICONS[id];
                            return (
                                <Tab
                                    key={id}
                                    type="button"
                                    $active={tab === id}
                                    aria-current={tab === id ? "true" : undefined}
                                    onClick={() => setTab(id)}
                                >
                                    <Icon />
                                    {label}
                                </Tab>
                            );
                        })}
                    </Tabs>
                    <ActivePanel />
                    {/* Data deletion belongs where people look for it,
                        and a fourth tab would change a designed screen
                        for the sake of one control. */}
                    {tab === "security" && <ChatHistoryPanel />}
                </Body>
            </Content>
        </Page>
    );
};

export default Settings;
