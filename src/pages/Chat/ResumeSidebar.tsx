import { ChangeEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Plus, Settings, SquarePen, Upload, X } from "lucide-react";
import Avatar from "../../components/Avatar";
import ConfirmDialog from "../../components/ConfirmDialog";
import Icon from "../../components/Icon";
import { Resume } from "../../api/resumes";
import { Conversation } from "../../api/chat";
import { User } from "../../api/auth";
import { colors, gradient } from "../../styles/tokens";
import { RESUME_ACCEPT } from "../../utils/fileValidation";
import { FIELD_OPTIONS } from "../Onboarding/options";
import logoIcon from "../../assets/logo-icon.png";
import logoText from "../../assets/logo-text.png";
import ResumeCard from "./ResumeCard";

const MOBILE = "860px";

/**
 * The sidebar is one full-height column of four regions: logo, chats,
 * resume, user. Only the chat list grows, and it scrolls inside its own
 * region — so however many conversations there are, the resume and the user
 * row stay on screen. Below the breakpoint the same column becomes a drawer.
 */
const Aside = styled.aside<{ $open: boolean }>`
    display: flex;
    flex-direction: column;
    width: 272px;
    height: 100%;
    flex-shrink: 0;
    background-color: #fff;
    border-right: 1px solid #eef0f3;

    @media (max-width: ${MOBILE}) {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 60;
        width: 288px;
        max-width: 86vw;
        box-shadow: 0 0 40px rgba(0, 0, 0, 0.16);
        transform: translateX(${({ $open }) => ($open ? "0" : "-100%")});
        transition: transform 0.25s ease;
    }
`;

const Backdrop = styled.div`
    display: none;

    @media (max-width: ${MOBILE}) {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 50;
        background-color: rgba(22, 22, 22, 0.35);
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 20px 18px;
`;

/**
 * A link, not a decoration. It is the only branding on the assistant screen,
 * and people expect a logo in the top-left corner to take them home — leaving
 * it inert means there is no way back to the landing page at all.
 */
const Logo = styled(Link)`
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    border-radius: 6px;

    &:focus-visible {
        outline: 2px solid ${colors.borderFocus};
        outline-offset: 4px;
    }
`;

const LogoIcon = styled.img`
    height: 22px;
    width: auto;
`;

const LogoText = styled.img`
    height: 17px;
    width: auto;
`;

/** Square and borderless, for an icon that is the whole control. */
const IconButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    color: ${colors.label};
    background: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
        color: ${colors.text};
        background-color: #f1f1f7;
    }

    &:focus-visible {
        outline: 2px solid ${colors.borderFocus};
        outline-offset: 1px;
    }
`;

/** Only useful in the drawer, so it is hidden on desktop. */
const CloseButton = styled(IconButton)`
    display: none;

    @media (max-width: ${MOBILE}) {
        display: flex;
    }
`;

/*
 * Takes whatever height is left. "min-height: 0" is the line that makes the
 * list scroll inside this region: a flex child's minimum height defaults to
 * its content's height, so without it a long history would push the resume
 * section off the bottom of the screen instead of scrolling.
 */
const ChatsSection = styled.section`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0 12px;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 30px;
    padding: 0 8px;
    margin-bottom: 6px;
`;

const SectionTitle = styled.h2`
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: ${colors.textMuted};
`;

const ConversationList = styled.ul`
    flex: 1;
    min-height: 0;
    margin: 0;
    padding: 0 0 12px;
    list-style: none;
    overflow-y: auto;
    /* A thin, quiet scrollbar: the list scrolls often, and the default bar
       was the heaviest thing in the sidebar. */
    scrollbar-width: thin;
    scrollbar-color: #d9dce3 transparent;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #d9dce3;
        border-radius: 3px;
    }
`;

const ConversationButton = styled.button<{ $active: boolean }>`
    display: block;
    width: 100%;
    margin-bottom: 2px;
    padding: 8px 10px;
    font-family: inherit;
    font-size: 13px;
    text-align: left;
    color: ${({ $active }) => ($active ? colors.text : colors.label)};
    font-weight: ${({ $active }) => ($active ? 500 : 400)};
    background-color: ${({ $active }) => ($active ? "#eeeefb" : "transparent")};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
        background-color: ${({ $active }) => ($active ? "#eeeefb" : "#f4f5f8")};
    }
`;

const Hint = styled.p`
    margin: 4px 8px 0;
    font-size: 12px;
    line-height: 1.5;
    color: ${colors.placeholder};
`;

const ResumeSection = styled.section`
    flex-shrink: 0;
    padding: 16px 12px;
    border-top: 1px solid #eef0f3;
`;

/*
 * Not a scroll container: each card's actions menu is positioned inside it
 * and would be clipped. Most users have one or two resumes; with more, the
 * chat list above gives up height instead, since it is the region that
 * scrolls.
 */
const ResumeList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

/** The main call to action when there is no resume yet. */
const UploadPrompt = styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 18px 12px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    color: ${colors.text};
    background-color: #fafbfd;
    border: 1px dashed #cfd3dc;
    border-radius: 12px;
    cursor: pointer;

    span {
        font-size: 11px;
        font-weight: 400;
        color: ${colors.textMuted};
    }

    &:hover {
        border-color: ${colors.borderFocus};
        background-color: #f6f6ff;
    }
`;

/** Secondary once a resume exists: a quiet text button under the list. */
const UploadAnother = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 6px 8px;
    font-family: inherit;
    font-size: 12px;
    color: ${colors.label};
    background: none;
    border: none;
    border-radius: 7px;
    cursor: pointer;

    &:hover:not(:disabled) {
        color: ${colors.text};
        background-color: #f4f5f8;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

/** Stays put until the next attempt, unlike the toast, which times out. */
const UploadError = styled.p`
    margin: 10px 0 0;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.45;
    color: ${colors.danger};
    background-color: ${colors.dangerSurface};
    border-radius: 8px;
`;

const UploadingHint = styled.p`
    margin: 10px 4px 0;
    font-size: 12px;
    color: ${colors.label};
    overflow-wrap: anywhere;
`;

const ProgressRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 6px 4px 0;
`;

const ProgressTrack = styled.div`
    flex: 1;
    height: 6px;
    background-color: #efeff4;
    border-radius: 3px;
    overflow: hidden;
`;

/**
 * The filled part. Width is a style prop rather than a class because it
 * changes on every progress event, and generating a class per percentage
 * would leave hundreds of rules behind in a single upload.
 */
const ProgressFill = styled.div`
    height: 100%;
    background: ${gradient};
    border-radius: 3px;
    /* Smooths the jumps between chunks without lagging behind the upload. */
    transition: width 160ms ease-out;
`;

const ProgressValue = styled.span`
    min-width: 34px;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    text-align: right;
    color: ${colors.label};
`;

const UserRow = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px 14px 20px;
    border-top: 1px solid #eef0f3;
`;

const UserText = styled.div`
    flex: 1;
    min-width: 0;
`;

const UserName = styled.p`
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    color: ${colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const UserField = styled.p`
    margin: 1px 0 0;
    font-size: 11px;
    color: ${colors.textMuted};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const SettingsLink = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    color: ${colors.label};
    border-radius: 8px;

    &:hover {
        color: ${colors.text};
        background-color: #f1f1f7;
    }

    &:focus-visible {
        outline: 2px solid ${colors.borderFocus};
        outline-offset: 1px;
    }
`;

export interface ResumeSidebarProps {
    user: User;
    resumes: Resume[];
    uploading: boolean;
    onUpload: (file: File) => void;
    /** Called only after the user has confirmed the deletion. */
    onDelete: (resume: Resume) => void;
    /** Name of the file currently uploading, if any. */
    uploadingName: string | null;
    /** 0 to 1 while a file is uploading. */
    uploadProgress: number;
    conversations: Conversation[];
    activeConversationId: string | null;
    onOpenConversation: (id: string) => void;
    onNewConversation: () => void;
    onDownloadResume: (resume: Resume) => void;
    /** Why the last attempt failed; cleared when a new one starts. */
    uploadError: string | null;
    /** Drawer state; ignored at desktop widths, where the column is static. */
    open: boolean;
    onClose: () => void;
}

const ResumeSidebar = ({
    user,
    resumes,
    uploading,
    onUpload,
    onDelete,
    open,
    onClose,
    uploadingName,
    uploadProgress,
    conversations,
    activeConversationId,
    onOpenConversation,
    onNewConversation,
    onDownloadResume,
    uploadError,
}: ResumeSidebarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingDelete, setPendingDelete] = useState<Resume | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) onUpload(file);
    };

    const chooseFile = () => fileInputRef.current?.click();

    const fieldLabel =
        FIELD_OPTIONS.find((option) => option.value === user.field)?.label ?? "";

    return (
        <>
            {open && <Backdrop onClick={onClose} />}
            <Aside $open={open}>
                <Header>
                    <Logo to="/" aria-label="CareerMate AI home">
                        <LogoIcon src={logoIcon} alt="" />
                        <LogoText src={logoText} alt="CareerMate AI" />
                    </Logo>
                    <CloseButton
                        type="button"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        <Icon icon={X} size="lg" />
                    </CloseButton>
                </Header>

                <ChatsSection aria-labelledby="sidebar-chats">
                    <SectionHeader>
                        <SectionTitle id="sidebar-chats">Chats</SectionTitle>
                        <IconButton
                            type="button"
                            onClick={onNewConversation}
                            aria-label="New chat"
                            title="New chat"
                        >
                            <Icon icon={SquarePen} size="md" />
                        </IconButton>
                    </SectionHeader>
                    {conversations.length === 0 ? (
                        <Hint>Your conversations will appear here.</Hint>
                    ) : (
                        <ConversationList>
                            {conversations.map((conversation) => {
                                const active =
                                    conversation.id === activeConversationId;
                                return (
                                    <li key={conversation.id}>
                                        <ConversationButton
                                            type="button"
                                            $active={active}
                                            aria-current={active ? "true" : undefined}
                                            onClick={() =>
                                                onOpenConversation(conversation.id)
                                            }
                                            title={conversation.title}
                                        >
                                            {conversation.title}
                                        </ConversationButton>
                                    </li>
                                );
                            })}
                        </ConversationList>
                    )}
                </ChatsSection>

                <ResumeSection aria-labelledby="sidebar-resume">
                    <SectionHeader>
                        <SectionTitle id="sidebar-resume">Resume</SectionTitle>
                    </SectionHeader>

                    {resumes.length > 0 && (
                        <ResumeList>
                            {resumes.map((resume) => (
                                <ResumeCard
                                    key={resume.id}
                                    resume={resume}
                                    onDownload={onDownloadResume}
                                    onRequestDelete={setPendingDelete}
                                />
                            ))}
                        </ResumeList>
                    )}

                    {resumes.length === 0 && !uploading ? (
                        <UploadPrompt type="button" onClick={chooseFile}>
                            <Icon icon={Upload} size="lg" />
                            Upload your resume
                            <span>PDF, up to 10 MB</span>
                        </UploadPrompt>
                    ) : (
                        <UploadAnother
                            type="button"
                            onClick={chooseFile}
                            disabled={uploading}
                        >
                            <Icon icon={Plus} size="sm" />
                            {uploading ? "Uploading…" : "Upload another"}
                        </UploadAnother>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={RESUME_ACCEPT}
                        hidden
                        onChange={handleChange}
                    />

                    {uploading && uploadingName && (
                        <>
                            <UploadingHint>
                                {uploadProgress >= 1
                                    ? `Processing ${uploadingName}…`
                                    : `Uploading ${uploadingName}…`}
                            </UploadingHint>
                            <ProgressRow>
                                <ProgressTrack
                                    role="progressbar"
                                    aria-label={`Uploading ${uploadingName}`}
                                    aria-valuenow={Math.round(uploadProgress * 100)}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                >
                                    <ProgressFill
                                        style={{ width: `${uploadProgress * 100}%` }}
                                    />
                                </ProgressTrack>
                                <ProgressValue>
                                    {Math.round(uploadProgress * 100)}%
                                </ProgressValue>
                            </ProgressRow>
                        </>
                    )}

                    {uploadError && <UploadError role="alert">{uploadError}</UploadError>}
                </ResumeSection>

                <UserRow>
                    <Avatar name={user.fullName} src={user.avatarUrl} size={32} />
                    <UserText>
                        <UserName>{user.displayName || user.fullName}</UserName>
                        {fieldLabel && <UserField>{fieldLabel}</UserField>}
                    </UserText>
                    <SettingsLink to="/settings" aria-label="Settings" title="Settings">
                        <Icon icon={Settings} size="lg" />
                    </SettingsLink>
                </UserRow>
            </Aside>

            {pendingDelete && (
                <ConfirmDialog
                    title="Delete this resume?"
                    message={
                        <>
                            <strong>{pendingDelete.fileName}</strong> will be
                            deleted, and the assistant will no longer be able to
                            read it. This cannot be undone.
                        </>
                    }
                    confirmLabel="Delete"
                    danger
                    onCancel={() => setPendingDelete(null)}
                    onConfirm={() => {
                        onDelete(pendingDelete);
                        setPendingDelete(null);
                    }}
                />
            )}
        </>
    );
};

export default ResumeSidebar;
