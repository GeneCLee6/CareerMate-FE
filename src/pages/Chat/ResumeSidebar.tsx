import { ChangeEvent, useRef } from "react";
import styled from "styled-components";
import Avatar from "../../components/Avatar";
import { Resume } from "../../api/resumes";
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

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 36px;
`;

const LogoIcon = styled.img`
    height: 22px;
    width: auto;
`;

const LogoText = styled.img`
    height: 17px;
    width: auto;
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

const CloseIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <path d="M6 6l12 12M18 6 6 18" />
    </svg>
);

const UploadIcon = () => (
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
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M12 16V8m0 0-3 3m3-3 3 3" />
    </svg>
);

const PdfIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="2" width="18" height="20" rx="3" fill="#e8effe" />
        <path
            d="M8 8h4a2 2 0 1 1 0 4H8V8Zm0 0v8"
            stroke="#2f6bff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const TrashIcon = () => (
    <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13h8l1-13" />
    </svg>
);

const BriefcaseIcon = () => (
    <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
);

const TargetIcon = () => (
    <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
    </svg>
);

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
                    <CloseIcon />
                </CloseButton>
                <Logo>
                <LogoIcon src={logoIcon} alt="" />
                <LogoText src={logoText} alt="CareerMate AI" />
            </Logo>

            <SectionTitle>My Resume</SectionTitle>
            <UploadButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                <UploadIcon />
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
                            <PdfIcon />
                            <FileName title={resume.fileName}>
                                {resume.fileName}
                            </FileName>
                            <DeleteButton
                                type="button"
                                onClick={() => onDelete(resume)}
                                aria-label={`Delete ${resume.fileName}`}
                            >
                                <TrashIcon />
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
                                <BriefcaseIcon />
                                Your field:
                            </ProfileLabel>
                            <ProfileValue>{fieldLabel}</ProfileValue>
                        </ProfileRow>
                    )}
                    {user.goal && (
                        <ProfileRow>
                            <ProfileLabel>
                                <TargetIcon />
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
