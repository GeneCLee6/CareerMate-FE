import { apiClient, SuccessData } from "./client";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
    id: string;
    conversation: string;
    role: ChatRole;
    content: string;
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
export function sendMessage(
    content: string,
    conversationId?: string
): Promise<SendMessageResult> {
    const path = conversationId
        ? `/chat/conversations/${conversationId}/messages`
        : "/chat/messages";

    return apiClient
        .post<SuccessData<SendMessageResult>>(path, { content })
        .then((res) => res.data);
}

export function deleteConversation(conversationId: string): Promise<void> {
    return apiClient.delete<void>(`/chat/conversations/${conversationId}`);
}
