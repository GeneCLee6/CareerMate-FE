import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ArrowUp, Menu, Mic, Plus } from "lucide-react";
import UserMenu from "../../components/UserMenu";
import Avatar from "../../components/Avatar";
import Icon from "../../components/Icon";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import {
    Resume,
    deleteResume,
    getResumeDownloadUrl,
    getResumes,
    uploadResume,
} from "../../api/resumes";
import {
    ChatMessage as ApiChatMessage,
    Conversation,
    deleteConversation,
    getChatStatus,
    getConversations,
    getMessages,
    streamMessage as streamChatMessage,
} from "../../api/chat";
import ResumeSidebar from "./ResumeSidebar";
import StreamingReply from "./StreamingReply";
import { colors, fontFamily, gradient } from "../../styles/tokens";
import { validateResumeFile } from "../../utils/fileValidation";
import {
    ATTACHMENT_ACCEPT,
    MAX_ATTACHMENTS,
    PendingAttachment,
    mediaTypeOf,
    toBase64,
    validateAttachment,
} from "../../utils/attachments";
import {
    DICTATION_LANGUAGES,
    useSpeechRecognition,
} from "../../hooks/useSpeechRecognition";
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

/** Sits above the thread when the server has no AI key configured. */
const StatusNotice = styled.p`
    margin: 0 24px 12px;
    padding: 10px 14px;
    font-size: 13px;
    line-height: 1.5;
    color: ${colors.label};
    background-color: #fff7e6;
    border: 1px solid #ffd591;
    border-radius: 10px;
`;

const ThreadLoading = styled.p`
    margin: 0;
    padding: 40px 0;
    text-align: center;
    font-size: 14px;
    color: ${colors.textMuted};
`;

const ThreadTools = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 0 24px;
`;

const ClearButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    font-family: inherit;
    font-size: 12px;
    color: ${colors.textMuted};
    background: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;

    &:hover:not(:disabled) {
        color: ${colors.danger};
        background-color: ${colors.dangerSurface};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
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

const AttachmentRow = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 0 10px;
    padding: 0;
    list-style: none;
`;

const AttachmentChip = styled.li`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: 220px;
    padding: 6px 8px 6px 6px;
    font-size: 12px;
    color: ${colors.text};
    background-color: #f4f4f8;
    border: 1px solid ${colors.border};
    border-radius: 10px;
`;

const ChipThumb = styled.img`
    width: 28px;
    height: 28px;
    object-fit: cover;
    border-radius: 6px;
    display: block;
`;

/** Stands in for a document, which has no thumbnail to show. */
const ChipBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.4px;
    color: #fff;
    background: ${gradient};
    border-radius: 6px;
`;

const ChipName = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const ChipRemove = styled.button`
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    padding: 0;
    font-size: 14px;
    line-height: 1;
    color: ${colors.label};
    background: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;

    &:hover {
        color: ${colors.text};
        background-color: #e6e6ec;
    }
`;

const LanguageSelect = styled.select`
    height: 28px;
    padding: 0 4px;
    font-family: inherit;
    font-size: 11px;
    color: ${colors.label};
    background-color: transparent;
    border: 1px solid ${colors.border};
    border-radius: 8px;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ListeningDot = styled.span`
    position: absolute;
    top: 4px;
    right: 4px;
    width: 7px;
    height: 7px;
    background-color: ${colors.danger};
    border-radius: 50%;
`;

const ComposerActions = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const HiddenInput = styled.input`
    display: none;
`;

const RoundButton = styled.button`
    position: relative;
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
    // The reply while it streams in; empty between replies.
    const [streamed, setStreamed] = useState({ thinking: "", text: "" });
    // Cancels the reply in flight, which also stops the model upstream.
    const streamAbort = useRef<AbortController | null>(null);
    const [chatError, setChatError] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [draft, setDraft] = useState("");
    const [clearing, setClearing] = useState(false);
    /** Null until the first load finishes, so the empty state is not shown first. */
    const [loadingThread, setLoadingThread] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [aiConfigured, setAiConfigured] = useState(true);
    const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
    const attachInputRef = useRef<HTMLInputElement>(null);

    // Dictation fills the input rather than sending: recognition mishears,
    // and sending automatically would send the mistakes too.
    const speech = useSpeechRecognition((text) => {
        setDraft((prev) => (prev ? `${prev} ${text}` : text));
    });
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
            .then((list) => {
                if (cancelled) return;
                setConversations(list);
                const latest = list[0];
                if (!latest) return;
                setConversationId(latest.id);
                return getMessages(latest.id).then((history) => {
                    if (!cancelled) setMessages(history);
                });
            })
            .catch(() => {
                // An empty thread is a fine starting point.
            })
            .finally(() => {
                // Only now is "no messages" the truth rather than "not yet".
                if (!cancelled) setLoadingThread(false);
            });

        // Asked once, so the screen can say the assistant is unavailable
        // before the user types a message and waits for it to fail.
        getChatStatus()
            .then(({ configured }) => {
                if (!cancelled) setAiConfigured(configured);
            })
            .catch(() => {
                // If even this cannot be reached, sending will say so.
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

    async function handleDownloadResume(resume: Resume) {
        try {
            const url = await getResumeDownloadUrl(resume.id);
            // Opened rather than fetched: the URL is presigned and short-lived,
            // and the browser handles the save dialog and the filename.
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (err) {
            showToast(
                err instanceof ApiError
                    ? err.message
                    : "Could not download that resume."
            );
        }
    }

    async function handleOpenConversation(id: string) {
        if (id === conversationId || sending) return;

        setDrawerOpen(false);
        setChatError(null);
        setLoadingThread(true);
        setConversationId(id);
        try {
            setMessages(await getMessages(id));
        } catch (err) {
            setChatError(
                err instanceof ApiError
                    ? err.message
                    : "Could not open that conversation."
            );
            setMessages([]);
        } finally {
            setLoadingThread(false);
        }
    }

    // Leaving the page mid-reply cancels it; the server rolls the turn back
    // and stops the model, so nobody pays for an answer nobody will read.
    useEffect(() => () => streamAbort.current?.abort(), []);

    /** Leaves the current conversation behind without deleting it. */
    function handleNewConversation() {
        streamAbort.current?.abort();
        setConversationId(null);
        setMessages([]);
        setChatError(null);
        setDrawerOpen(false);
    }

    async function handleClearConversation() {
        if (!conversationId) return;
        // A conversation is not much work to recreate and the messages are
        // still on screen until it succeeds, so a confirm() is proportionate
        // here — the irreversible bulk delete in Settings gets a real dialog.
        if (
            !window.confirm(
                "Delete this conversation? This cannot be undone."
            )
        ) {
            return;
        }

        setClearing(true);
        setChatError(null);
        try {
            await deleteConversation(conversationId);
            setMessages([]);
            setConversationId(null);
            setConversations((prev) =>
                prev.filter((c) => c.id !== conversationId)
            );
            showToast("Conversation deleted");
        } catch (err) {
            setChatError(
                err instanceof ApiError
                    ? err.message
                    : "Could not delete that conversation. Please try again."
            );
        } finally {
            setClearing(false);
        }
    }

    function handleAttach(event: ChangeEvent<HTMLInputElement>) {
        const picked: File[] = Array.from(event.target.files ?? []);
        // Reset immediately so picking the same file twice still fires change.
        event.target.value = "";
        if (picked.length === 0) return;

        setChatError(null);

        if (attachments.length + picked.length > MAX_ATTACHMENTS) {
            setChatError(`You can attach up to ${MAX_ATTACHMENTS} files at once.`);
            return;
        }

        const accepted: PendingAttachment[] = [];
        for (const file of picked) {
            const problem = validateAttachment(file);
            if (problem) {
                setChatError(problem);
                continue;
            }
            const mediaType = mediaTypeOf(file);
            const isImage = mediaType.startsWith("image/");
            accepted.push({
                id: `${file.name}-${file.lastModified}-${file.size}`,
                file,
                fileName: file.name,
                mediaType,
                kind: isImage ? "image" : "document",
                previewUrl: isImage ? URL.createObjectURL(file) : undefined,
            });
        }
        setAttachments((prev) => [...prev, ...accepted]);
    }

    function removeAttachment(id: string) {
        setAttachments((prev) => {
            const going = prev.find((a) => a.id === id);
            // Object URLs are held by the browser until revoked.
            if (going?.previewUrl) URL.revokeObjectURL(going.previewUrl);
            return prev.filter((a) => a.id !== id);
        });
    }

    async function handleSend(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const text = draft.trim();
        // A file on its own is a complete message: dropping in a screenshot
        // and asking nothing is a reasonable way to start.
        if ((!text && attachments.length === 0) || sending) return;

        const sendingAttachments = attachments;
        setDraft("");
        setAttachments([]);
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
                attachments: sendingAttachments.map(
                    ({ fileName, mediaType, kind }) => ({
                        fileName,
                        mediaType,
                        kind,
                    })
                ),
                createdAt: new Date().toISOString(),
            },
        ]);

        try {
            const encoded = await Promise.all(
                sendingAttachments.map(async (attachment) => ({
                    fileName: attachment.fileName,
                    mediaType: attachment.mediaType,
                    data: await toBase64(attachment.file),
                }))
            );

            const controller = new AbortController();
            streamAbort.current = controller;
            const result = await streamChatMessage(
                text,
                conversationId ?? undefined,
                encoded,
                {
                    onThinking: (piece) =>
                        setStreamed((prev) => ({
                            ...prev,
                            thinking: prev.thinking + piece,
                        })),
                    onText: (piece) =>
                        setStreamed((prev) => ({ ...prev, text: prev.text + piece })),
                },
                controller.signal
            );

            // The bytes are on their way; the previews are no longer needed.
            sendingAttachments.forEach((a) => {
                if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
            });
            setConversationId(result.conversation.id);
            // A new conversation has to reach the list, and an existing one
            // moves to the top because it was just used.
            setConversations((prev) => [
                result.conversation,
                ...prev.filter((c) => c.id !== result.conversation.id),
            ]);
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
            // Cancelled on purpose (a new chat, or leaving): not an error.
            if (err instanceof DOMException && err.name === "AbortError") {
                return;
            }
            setDraft(text);
            // Give the files back too, so a retry is one click.
            setAttachments(sendingAttachments);
            setChatError(
                err instanceof ApiError
                    ? err.message
                    : "Could not send that message. Please try again."
            );
        } finally {
            setSending(false);
            setStreamed({ thinking: "", text: "" });
            streamAbort.current = null;
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
                conversations={conversations}
                activeConversationId={conversationId}
                onOpenConversation={handleOpenConversation}
                onNewConversation={handleNewConversation}
                onDownloadResume={handleDownloadResume}
                uploadError={uploadError}
            />

            <Main>
                <TopBar>
                    <MenuButton
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open resume panel"
                    >
                        <Icon icon={Menu} size="lg" />
                    </MenuButton>
                    <TopBarSpacer />
                    <UserMenu />
                </TopBar>

                {!aiConfigured && (
                    <StatusNotice role="status">
                        The assistant is not configured on this server yet, so
                        replies are unavailable. Everything else — resumes,
                        profile, settings — still works.
                    </StatusNotice>
                )}
                {messages.length > 0 && conversationId && (
                    <ThreadTools>
                        <ClearButton
                            type="button"
                            onClick={handleClearConversation}
                            disabled={clearing || sending}
                        >
                            {clearing ? "Deleting…" : "Delete this conversation"}
                        </ClearButton>
                    </ThreadTools>
                )}
                <Thread ref={threadRef}>
                    {loadingThread ? (
                        <ThreadLoading>Loading your conversation…</ThreadLoading>
                    ) : messages.length === 0 ? (
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
                                        <Bubble>
                                            <StreamingReply
                                                thinking={streamed.thinking}
                                                text={streamed.text}
                                            />
                                        </Bubble>
                                    </MessageBody>
                                </Message>
                            )}
                        </ThreadInner>
                    )}
                </Thread>

                <Composer onSubmit={handleSend}>
                    {(chatError || speech.error) && (
                        <ChatError role="alert">
                            {chatError ?? speech.error}
                        </ChatError>
                    )}
                    <ComposerBox>
                        {attachments.length > 0 && (
                            <AttachmentRow>
                                {attachments.map((attachment) => (
                                    <AttachmentChip key={attachment.id}>
                                        {attachment.previewUrl ? (
                                            <ChipThumb
                                                src={attachment.previewUrl}
                                                alt=""
                                            />
                                        ) : (
                                            <ChipBadge aria-hidden="true">
                                                PDF
                                            </ChipBadge>
                                        )}
                                        <ChipName title={attachment.fileName}>
                                            {attachment.fileName}
                                        </ChipName>
                                        <ChipRemove
                                            type="button"
                                            onClick={() =>
                                                removeAttachment(attachment.id)
                                            }
                                            aria-label={`Remove ${attachment.fileName}`}
                                        >
                                            ×
                                        </ChipRemove>
                                    </AttachmentChip>
                                ))}
                            </AttachmentRow>
                        )}
                        <Input
                            value={
                                speech.interim
                                    ? `${draft}${draft ? " " : ""}${speech.interim}`
                                    : draft
                            }
                            onChange={(e) => setDraft(e.target.value)}
                            // While words are still being heard they are not
                            // the user's text yet; typing over them would
                            // fight the next result.
                            readOnly={Boolean(speech.interim)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    e.currentTarget.form?.requestSubmit();
                                }
                            }}
                            placeholder={
                                speech.listening
                                    ? "Listening…"
                                    : "Type your question..."
                            }
                            rows={1}
                            aria-label="Message CareerMate AI"
                        />
                        <ComposerActions>
                            <HiddenInput
                                ref={attachInputRef}
                                type="file"
                                accept={ATTACHMENT_ACCEPT}
                                multiple
                                onChange={handleAttach}
                            />
                            <RoundButton
                                type="button"
                                onClick={() => attachInputRef.current?.click()}
                                disabled={attachments.length >= MAX_ATTACHMENTS}
                                aria-label="Add attachment"
                            >
                                <Icon icon={Plus} size="lg" />
                            </RoundButton>
                            <RightActions>
                                {speech.supported && (
                                    <LanguageSelect
                                        value={speech.language}
                                        onChange={(e) =>
                                            speech.setLanguage(e.target.value)
                                        }
                                        disabled={speech.listening}
                                        aria-label="Dictation language"
                                        title="Dictation language"
                                    >
                                        {DICTATION_LANGUAGES.map((language) => (
                                            <option
                                                key={language.code}
                                                value={language.code}
                                            >
                                                {language.label}
                                            </option>
                                        ))}
                                    </LanguageSelect>
                                )}
                                {speech.supported && (
                                    <RoundButton
                                        type="button"
                                        onClick={
                                            speech.listening
                                                ? speech.stop
                                                : speech.start
                                        }
                                        aria-label={
                                            speech.listening
                                                ? "Stop dictating"
                                                : "Dictate a message"
                                        }
                                        aria-pressed={speech.listening}
                                    >
                                        <Icon icon={Mic} size="lg" />
                                        {speech.listening && (
                                            <ListeningDot aria-hidden="true" />
                                        )}
                                    </RoundButton>
                                )}
                                <SendButton
                                    type="submit"
                                    disabled={
                                        (!draft.trim() &&
                                            attachments.length === 0) ||
                                        sending
                                    }
                                    aria-label="Send message"
                                >
                                    <Icon icon={ArrowUp} size="lg" />
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
