import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import UserMenu from "../../components/UserMenu";
import Avatar from "../../components/Avatar";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import {
    Resume,
    deleteResume,
    getResumes,
    uploadResume,
} from "../../api/resumes";
import {
    ChatMessage as ApiChatMessage,
    getConversations,
    getMessages,
    sendMessage as sendChatMessage,
} from "../../api/chat";
import ResumeSidebar from "./ResumeSidebar";
import { colors, fontFamily } from "../../styles/tokens";
import { validateResumeFile } from "../../utils/fileValidation";
import logoIcon from "../../assets/logo-icon.png";

const Page = styled.div`
    display: flex;
    height: 100vh;
    overflow: hidden;
    font-family: ${fontFamily};
    color: ${colors.text};
    background-color: #f9fafc;
`;

const Main = styled.div`
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

const TopBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
`;

/** Opens the resume drawer; the sidebar is a static column above this width. */
const MenuButton = styled.button`
    display: none;

    @media (max-width: 860px) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        color: ${colors.text};
        background: none;
        border: 1px solid ${colors.border};
        border-radius: 10px;
        cursor: pointer;
    }
`;

const TopBarSpacer = styled.div`
    flex: 1;
`;

const Thread = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 0 24px;
`;

const ThreadInner = styled.div`
    max-width: 720px;
    margin: 0 auto;
    padding-bottom: 24px;
`;

const Greeting = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
`;

const GreetingTitle = styled.h1`
    margin: 0 0 10px;
    font-size: 36px;
    font-weight: 400;
    color: ${colors.text};
`;

const GreetingSubtitle = styled.p`
    margin: 0;
    font-size: 15px;
    color: ${colors.label};
`;

const Message = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 28px;
`;

const AiAvatar = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    background-color: #2f6bff;
    border-radius: 50%;
`;

const AiAvatarIcon = styled.img`
    width: 18px;
    height: 18px;
    filter: brightness(0) invert(1);
`;

const MessageBody = styled.div`
    min-width: 0;
`;

const Author = styled.p`
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 600;
    color: ${colors.text};
`;

const Bubble = styled.div`
    display: inline-block;
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.5;
    color: ${colors.text};
    background-color: #eef0f5;
    border-radius: 12px;
    white-space: pre-wrap;
`;

/** Kept above the composer so a failed send stays readable while retrying. */
const ChatError = styled.p`
    margin: 0 0 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: ${colors.danger};
    background-color: ${colors.dangerSurface};
    border-radius: 10px;
`;

const Composer = styled.form`
    max-width: 720px;
    width: 100%;
    margin: 0 auto;
    padding: 0 24px 32px;
`;

const ComposerBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
    background-color: #fff;
    border: 1px solid ${colors.border};
    border-radius: 16px;
    transition: border-color 0.2s ease;

    &:focus-within {
        border-color: ${colors.borderFocus};
    }
`;

const Input = styled.textarea`
    width: 100%;
    min-height: 24px;
    max-height: 160px;
    font-family: inherit;
    font-size: 15px;
    color: ${colors.text};
    background: none;
    border: none;
    outline: none;
    resize: none;

    &::placeholder {
        color: ${colors.placeholder};
    }
`;

const ComposerActions = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const RoundButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    color: ${colors.label};
    background-color: #f2f3f6;
    border: none;
    border-radius: 50%;
    cursor: pointer;

    &:hover {
        background-color: #e7e9ee;
    }
`;

const RightActions = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const SendButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    color: #fff;
    background-color: #2f6bff;
    border: none;
    border-radius: 50%;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const MenuIcon = () => (
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
        <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
);

const PlusIcon = () => (
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
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const MicIcon = () => (
    <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
);

const SparkIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    </svg>
);

const Chat = () => {
    const { user } = useAuth();
    const showToast = useToast();

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadingName, setUploadingName] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [messages, setMessages] = useState<ApiChatMessage[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [draft, setDraft] = useState("");
    const threadRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;
        getResumes()
            .then((list) => {
                if (!cancelled) setResumes(list);
            })
            .catch(() => {
                // An empty list is a reasonable fallback for the sidebar.
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        // Resume the most recent conversation so a refresh doesn't lose it.
        getConversations()
            .then((conversations) => {
                const latest = conversations[0];
                if (cancelled || !latest) return;
                setConversationId(latest.id);
                return getMessages(latest.id).then((history) => {
                    if (!cancelled) setMessages(history);
                });
            })
            .catch(() => {
                // An empty thread is a fine starting point.
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        threadRef.current?.scrollTo({
            top: threadRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    const handleUpload = useCallback(
        async (file: File) => {
            // Reject what the server would reject, before spending the upload.
            const problem = validateResumeFile(file);
            if (problem) {
                setUploadError(problem);
                return;
            }

            setUploadError(null);
            setUploadingName(file.name);
            setUploadProgress(0);
            setUploading(true);
            try {
                const resume = await uploadResume(file, setUploadProgress);
                setResumes((prev) => [resume, ...prev]);
                showToast("Resume uploaded");
            } catch (err) {
                const message =
                    err instanceof ApiError
                        ? err.message
                        : "Upload failed. Please try again.";
                // The toast times out; the sidebar keeps the reason visible.
                setUploadError(message);
                showToast(message, 5000);
            } finally {
                setUploading(false);
                setUploadingName(null);
                setUploadProgress(0);
            }
        },
        [showToast]
    );

    const handleDelete = useCallback(
        async (resume: Resume) => {
            const previous = resumes;
            setResumes((prev) => prev.filter((r) => r.id !== resume.id));
            try {
                await deleteResume(resume.id);
                showToast("Resume deleted");
            } catch (err) {
                setResumes(previous);
                showToast(
                    err instanceof ApiError
                        ? err.message
                        : "Could not delete the resume."
                );
            }
        },
        [resumes, showToast]
    );

    async function handleSend(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const text = draft.trim();
        if (!text || sending) return;

        setDraft("");
        setChatError(null);
        setSending(true);

        // Show the user's turn straight away; reconcile with the server after.
        const pendingId = `pending-${Date.now()}`;
        setMessages((prev) => [
            ...prev,
            {
                id: pendingId,
                conversation: conversationId ?? "",
                role: "user",
                content: text,
                createdAt: new Date().toISOString(),
            },
        ]);

        try {
            const result = await sendChatMessage(
                text,
                conversationId ?? undefined
            );
            setConversationId(result.conversation.id);
            setMessages((prev) => [
                ...prev.filter((message) => message.id !== pendingId),
                result.userMessage,
                result.assistantMessage,
            ]);
        } catch (err) {
            // Take the unanswered turn back out and let them retry it.
            setMessages((prev) =>
                prev.filter((message) => message.id !== pendingId)
            );
            setDraft(text);
            setChatError(
                err instanceof ApiError
                    ? err.message
                    : "Could not send that message. Please try again."
            );
        } finally {
            setSending(false);
        }
    }

    if (!user) return null;

    return (
        <Page>
            <ResumeSidebar
                user={user}
                resumes={resumes}
                uploading={uploading}
                onUpload={handleUpload}
                onDelete={handleDelete}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                uploadingName={uploadingName}
                uploadProgress={uploadProgress}
                uploadError={uploadError}
            />

            <Main>
                <TopBar>
                    <MenuButton
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open resume panel"
                    >
                        <MenuIcon />
                    </MenuButton>
                    <TopBarSpacer />
                    <UserMenu />
                </TopBar>

                <Thread ref={threadRef}>
                    {messages.length === 0 ? (
                        <Greeting>
                            <GreetingTitle>
                                Hi, {user.displayName || user.fullName} 👋
                            </GreetingTitle>
                            <GreetingSubtitle>
                                I&apos;m here to help with your resume,
                                interviews, and career planning.
                            </GreetingSubtitle>
                        </Greeting>
                    ) : (
                        <ThreadInner>
                            {messages.map((message) => (
                                <Message key={message.id}>
                                    {message.role === "user" ? (
                                        <Avatar
                                            name={user.fullName}
                                            src={user.avatarUrl}
                                            size={32}
                                        />
                                    ) : (
                                        <AiAvatar>
                                            <AiAvatarIcon
                                                src={logoIcon}
                                                alt=""
                                            />
                                        </AiAvatar>
                                    )}
                                    <MessageBody>
                                        <Author>
                                            {message.role === "user"
                                                ? "You"
                                                : "CareerMate AI"}
                                        </Author>
                                        <Bubble>{message.content}</Bubble>
                                    </MessageBody>
                                </Message>
                            ))}
                            {sending && (
                                <Message>
                                    <AiAvatar>
                                        <AiAvatarIcon src={logoIcon} alt="" />
                                    </AiAvatar>
                                    <MessageBody>
                                        <Author>CareerMate AI</Author>
                                        <Bubble>AI is thinking...</Bubble>
                                    </MessageBody>
                                </Message>
                            )}
                        </ThreadInner>
                    )}
                </Thread>

                <Composer onSubmit={handleSend}>
                    {chatError && <ChatError role="alert">{chatError}</ChatError>}
                    <ComposerBox>
                        <Input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    e.currentTarget.form?.requestSubmit();
                                }
                            }}
                            placeholder="Type your question..."
                            rows={1}
                            aria-label="Message CareerMate AI"
                        />
                        <ComposerActions>
                            <RoundButton type="button" aria-label="Add attachment">
                                <PlusIcon />
                            </RoundButton>
                            <RightActions>
                                <RoundButton type="button" aria-label="Voice input">
                                    <MicIcon />
                                </RoundButton>
                                <SendButton
                                    type="submit"
                                    disabled={!draft.trim() || sending}
                                    aria-label="Send message"
                                >
                                    <SparkIcon />
                                </SendButton>
                            </RightActions>
                        </ComposerActions>
                    </ComposerBox>
                </Composer>
            </Main>
        </Page>
    );
};

export default Chat;
