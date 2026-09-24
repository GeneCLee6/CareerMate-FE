import { ChangeEvent, useRef } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
    Briefcase,
    Download,
    FileText,
    Target,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import Avatar from "../../components/Avatar";
import Icon from "../../components/Icon";
import { Resume } from "../../api/resumes";
import { Conversation } from "../../api/chat";
import { User } from "../../api/auth";
import { colors, gradient } from "../../styles/tokens";
import { RESUME_ACCEPT } from "../../utils/fileValidation";
import { FIELD_OPTIONS } from "../Onboarding/options";
import logoIcon from "../../assets/logo-icon.png";
import logoText from "../../assets/logo-text.png";

const MOBILE = "860px";

/**
 * A column on desktop. Below the breakpoint it becomes a drawer over the chat,
 * because hiding it outright left no way to manage resumes on a phone.
 */
const Aside = styled.aside<{ $open: boolean }>`
    display: flex;
    flex-direction: column;
    width: 268px;
    flex-shrink: 0;
    padding: 24px 20px;
    background-color: #fff;
    border-right: 1px solid #eef0f3;

    @media (max-width: ${MOBILE}) {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 60;
        width: 284px;
        max-width: 86vw;
        overflow-y: auto;
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

/** Only useful in the drawer, so it is hidden on desktop. */
const CloseButton = styled.button`
    display: none;

    @media (max-width: ${MOBILE}) {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 18px;
        right: 16px;
        width: 32px;
        height: 32px;
        color: ${colors.label};
        background: none;
        border: none;
        border-radius: 8px;
        cursor: pointer;
    }
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
    margin-bottom: 36px;
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

const NewChatButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 38px;
    margin-bottom: 18px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    color: ${colors.text};
    background-color: #fff;
    border: 1px solid ${colors.border};
    border-radius: 19px;
    cursor: pointer;

    &:hover {
        border-color: ${colors.borderFocus};
    }
`;

const ConversationList = styled.ul`
    margin: 14px 0 0;
    padding: 0;
    list-style: none;
    /* Bounded so a long history cannot push the resume panel off-screen. */
    max-height: 220px;
    overflow-y: auto;
`;

const ConversationItem = styled.li`
    margin-bottom: 4px;
`;

const ConversationButton = styled.button<{ $active: boolean }>`
    display: block;
    width: 100%;
    padding: 8px 10px;
    font-family: inherit;
    font-size: 13px;
    text-align: left;
    color: ${({ $active }) => ($active ? colors.text : colors.label)};
    background-color: ${({ $active }) => ($active ? "#f1f1f7" : "transparent")};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
        background-color: #f1f1f7;
    }
`;

const NoConversationsHint = styled.p`
    margin: 12px 0 0;
    font-size: 12px;
    color: ${colors.placeholder};
`;

const DownloadButton = styled.a`
    display: inline-flex;
    align-items: center;
    padding: 4px;
    color: ${colors.label};
    border-radius: 6px;
    cursor: pointer;

    &:hover {
        color: ${colors.text};
        background-color: #eeeef4;
    }
`;

const SectionTitle = styled.h2`
    margin: 0 0 14px;
    font-size: 15px;
    font-weight: 400;
    color: ${colors.text};
`;

const UploadButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 44px;
    font-family: inherit;
    font-size: 14px;
    color: ${colors.text};
    background-color: #fff;
    border: 1px solid ${colors.border};
    border-radius: 22px;
    cursor: pointer;

    &:hover:not(:disabled) {
        background-color: #fafafa;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EmptyHint = styled.p`
    margin: 14px 0 0;
    font-size: 12px;
    color: ${colors.placeholder};
    text-align: center;
`;

/** Stays put until the next attempt, unlike the toast, which times out. */
const UploadError = styled.p`
    margin: 12px 0 0;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.45;
    color: ${colors.danger};
    background-color: ${colors.dangerSurface};
    border-radius: 8px;
`;

const UploadingHint = styled.p`
    margin: 12px 0 0;
    font-size: 12px;
    color: ${colors.label};
    overflow-wrap: anywhere;
`;

const ProgressRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
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

const ResumeList = styled.ul`
    margin: 18px 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

/** The delete control only appears on hover, as annotated in the design. */
const ResumeRow = styled.li`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 6px;
    border-radius: 8px;

    &:hover {
        background-color: #f6f7f9;
    }

    &:hover button,
    & button:focus-visible {
        opacity: 1;
    }
`;

/** Marks a row as a document at a glance. */
const FileBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    color: #2f6bff;
    background-color: #e8effe;
    border-radius: 7px;
`;

const FileName = styled.span`
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: ${colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const DeleteButton = styled.button`
    display: flex;
    padding: 4px;
    color: ${colors.placeholder};
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s ease;

    &:hover {
        color: ${colors.danger};
    }
`;

const Spacer = styled.div`
    flex: 1;
`;

const UserBlock = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
`;

const UserName = styled.span`
    font-size: 14px;
    color: ${colors.text};
`;

const ProfileCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
    background-color: #f6f7f9;
    border-radius: 12px;
`;

const ProfileRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ProfileLabel = styled.span`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: ${colors.placeholder};
`;

const ProfileValue = styled.span`
    font-size: 13px;
    color: ${colors.text};
`;

export interface ResumeSidebarProps {
    user: User;
    resumes: Resume[];
    uploading: boolean;
    onUpload: (file: File) => void;
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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) onUpload(file);
    };

    const fieldLabel =
        FIELD_OPTIONS.find((option) => option.value === user.field)?.label ?? "";

    return (
        <>
            {open && <Backdrop onClick={onClose} />}
            <Aside $open={open}>
                <CloseButton
                    type="button"
                    onClick={onClose}
                    aria-label="Close resume panel"
                >
                    <Icon icon={X} size="lg" />
                </CloseButton>
                <Logo to="/" aria-label="CareerMate AI home">
                <LogoIcon src={logoIcon} alt="" />
                <LogoText src={logoText} alt="CareerMate AI" />
            </Logo>

            <NewChatButton type="button" onClick={onNewConversation}>
                + New conversation
            </NewChatButton>

            <SectionTitle>Conversations</SectionTitle>
            {conversations.length === 0 ? (
                <NoConversationsHint>
                    Your conversations will appear here.
                </NoConversationsHint>
            ) : (
                <ConversationList>
                    {conversations.map((conversation) => (
                        <ConversationItem key={conversation.id}>
                            <ConversationButton
                                type="button"
                                $active={conversation.id === activeConversationId}
                                aria-current={
                                    conversation.id === activeConversationId
                                        ? "true"
                                        : undefined
                                }
                                onClick={() => onOpenConversation(conversation.id)}
                                title={conversation.title}
                            >
                                {conversation.title}
                            </ConversationButton>
                        </ConversationItem>
                    ))}
                </ConversationList>
            )}

            <SectionTitle>My Resume</SectionTitle>
            <UploadButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                <Icon icon={Upload} size="lg" />
                {uploading
                    ? "Uploading..."
                    : resumes.length
                      ? "Upload other resume"
                      : "Upload resume"}
            </UploadButton>
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

            {resumes.length === 0 && !uploading ? (
                <EmptyHint>You haven&apos;t uploaded a resume</EmptyHint>
            ) : (
                <ResumeList>
                    {resumes.map((resume) => (
                        <ResumeRow key={resume.id}>
                            <FileBadge>
                                <Icon icon={FileText} size="md" />
                            </FileBadge>
                            <FileName title={resume.fileName}>
                                {resume.fileName}
                            </FileName>
                            <DownloadButton
                                as="button"
                                type="button"
                                onClick={() => onDownloadResume(resume)}
                                aria-label={`Download ${resume.fileName}`}
                                title="Download"
                            >
                                <Icon icon={Download} size="md" />
                            </DownloadButton>
                            <DeleteButton
                                type="button"
                                onClick={() => onDelete(resume)}
                                aria-label={`Delete ${resume.fileName}`}
                            >
                                <Icon icon={Trash2} size="md" />
                            </DeleteButton>
                        </ResumeRow>
                    ))}
                </ResumeList>
            )}

            <Spacer />

            <UserBlock>
                <Avatar name={user.fullName} src={user.avatarUrl} size={30} />
                <UserName>{user.displayName || user.fullName}</UserName>
            </UserBlock>

            {(fieldLabel || user.goal) && (
                <ProfileCard>
                    {fieldLabel && (
                        <ProfileRow>
                            <ProfileLabel>
                                <Icon icon={Briefcase} size="sm" />
                                Your field:
                            </ProfileLabel>
                            <ProfileValue>{fieldLabel}</ProfileValue>
                        </ProfileRow>
                    )}
                    {user.goal && (
                        <ProfileRow>
                            <ProfileLabel>
                                <Icon icon={Target} size="sm" />
                                Goal:
                            </ProfileLabel>
                            <ProfileValue>{user.goal}</ProfileValue>
                        </ProfileRow>
                    )}
                </ProfileCard>
            )}
            </Aside>
        </>
    );
};

export default ResumeSidebar;
