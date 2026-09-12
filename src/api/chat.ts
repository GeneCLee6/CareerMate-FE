import { apiClient, SuccessData } from "./client";

export type ChatRole = "user" | "assistant";

export interface MessageAttachment {
    fileName: string;
    mediaType: string;
    kind: "image" | "document";
}

export interface ChatMessage {
    id: string;
    conversation: string;
    role: ChatRole;
    content: string;
    /** What was attached. The files themselves are not retained. */
    attachments?: MessageAttachment[];
    createdAt: string;
}

export interface Conversation {
    id: string;
    title: string;
    lastMessageAt: string;
    createdAt: string;
}

interface SendMessageResult {
    conversation: Conversation;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
}

/** Whether the server has an AI key configured at all. */
export function getChatStatus(): Promise<{ configured: boolean }> {
    return apiClient
        .get<SuccessData<{ configured: boolean }>>("/chat/status")
        .then((res) => res.data);
}

export function getConversations(): Promise<Conversation[]> {
    return apiClient
        .get<SuccessData<Conversation[]>>("/chat/conversations")
        .then((res) => res.data);
}

export function getMessages(conversationId: string): Promise<ChatMessage[]> {
    return apiClient
        .get<SuccessData<ChatMessage[]>>(
            `/chat/conversations/${conversationId}/messages`
        )
        .then((res) => res.data);
}

/**
 * Sends a message and returns both turns. Omit `conversationId` to start a new
 * conversation — the server creates one from the first message.
 */
/** Base64 payload, as the API takes it. */
export interface OutgoingAttachment {
    fileName: string;
    mediaType: string;
    data: string;
}

export function sendMessage(
    content: string,
    conversationId?: string,
    attachments?: OutgoingAttachment[]
): Promise<SendMessageResult> {
    const path = conversationId
        ? `/chat/conversations/${conversationId}/messages`
        : "/chat/messages";

    return apiClient
        .post<SuccessData<SendMessageResult>>(path, {
            content,
            // Omitted rather than sent empty, so an ordinary message keeps the
            // request body it has always had.
            ...(attachments?.length ? { attachments } : {}),
        })
        .then((res) => res.data);
}

/** How much was removed, so the confirmation can say what actually happened. */
export interface DeletedHistory {
    conversations: number;
    messages: number;
}

/**
 * Deletes every conversation. The assistant only opens the most recent one,
 * so this is the only way to reach the older ones at all.
 */
export function deleteAllConversations(): Promise<DeletedHistory> {
    return apiClient
        .delete<SuccessData<DeletedHistory>>("/chat/conversations")
        .then((res) => res.data);
}

export function deleteConversation(conversationId: string): Promise<void> {
    return apiClient.delete<void>(`/chat/conversations/${conversationId}`);
}
