import { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "../../components/Modal";
import AlertBanner from "../../components/AlertBanner";
import { useToast } from "../../components/Toast";
import { ApiError } from "../../api/client";
import {
    Conversation,
    deleteAllConversations,
    getConversations,
} from "../../api/chat";
import { colors } from "../../styles/tokens";

const Explanation = styled.p`
    margin: 0 0 20px;
    font-size: 14px;
    line-height: 1.6;
    color: ${colors.label};
`;

const Count = styled.strong`
    color: ${colors.text};
`;

/**
 * Destructive actions get their own colour rather than the brand gradient:
 * a button that deletes everything should not look like a button that saves.
 */
const DangerButton = styled.button`
    height: 44px;
    padding: 0 24px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    background-color: ${colors.danger};
    border: none;
    border-radius: 22px;
    cursor: pointer;

    &:hover:not(:disabled) {
        filter: brightness(0.94);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ModalTitle = styled.h3`
    margin: 0 0 12px;
    font-size: 18px;
    font-weight: 700;
    color: ${colors.text};
`;

const ModalText = styled.p`
    margin: 0 0 24px;
    font-size: 14px;
    line-height: 1.6;
    color: ${colors.label};
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: center;
    gap: 12px;
`;

const CancelButton = styled.button`
    height: 40px;
    padding: 0 20px;
    font-family: inherit;
    font-size: 14px;
    color: ${colors.text};
    background-color: #fff;
    border: 1px solid ${colors.border};
    border-radius: 20px;
    cursor: pointer;
`;

const BannerSlot = styled.div`
    margin-bottom: 16px;
`;

/**
 * Deleting chat history.
 *
 * It lives in Settings rather than in the assistant because the assistant only
 * ever opens the most recent conversation — everything older is invisible
 * there, so this is the only place those conversations can be reached at all.
 */
const ChatHistoryPanel = () => {
    const [conversations, setConversations] = useState<Conversation[] | null>(
        null
    );
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const showToast = useToast();

    useEffect(() => {
        let cancelled = false;
        getConversations()
            .then((list) => {
                if (!cancelled) setConversations(list);
            })
            .catch(() => {
                // Not being able to count them should not hide the control —
                // deleting is still possible, and still the point of the page.
                if (!cancelled) setConversations([]);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    async function handleDelete() {
        setDeleting(true);
        setError(null);
        try {
            const removed = await deleteAllConversations();
            setConversations([]);
            setConfirming(false);
            // Say what actually happened rather than "done".
            showToast(
                removed.conversations === 0
                    ? "There was nothing to delete"
                    : `Deleted ${removed.conversations} conversation${
                          removed.conversations === 1 ? "" : "s"
                      } and ${removed.messages} message${
                          removed.messages === 1 ? "" : "s"
                      }`
            );
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Could not delete your history. Please try again."
            );
            setConfirming(false);
        } finally {
            setDeleting(false);
        }
    }

    const count = conversations?.length ?? 0;

    return (
        <section aria-labelledby="chat-history-heading">
            <h2 id="chat-history-heading">Chat History</h2>

            {error && (
                <BannerSlot>
                    <AlertBanner>{error}</AlertBanner>
                </BannerSlot>
            )}

            <Explanation>
                {conversations === null ? (
                    "Counting your conversations…"
                ) : count === 0 ? (
                    "You have no saved conversations."
                ) : (
                    <>
                        You have <Count>{count}</Count> saved conversation
                        {count === 1 ? "" : "s"}. The assistant only opens your
                        most recent one, so deleting here is the only way to
                        remove the older ones. This cannot be undone.
                    </>
                )}
            </Explanation>

            <DangerButton
                type="button"
                onClick={() => setConfirming(true)}
                disabled={count === 0 || deleting}
            >
                Delete all chat history
            </DangerButton>

            {confirming && (
                <Modal
                    onClose={() => setConfirming(false)}
                    labelledBy="confirm-delete-history"
                >
                    <ModalTitle id="confirm-delete-history">
                        Delete all chat history?
                    </ModalTitle>
                    <ModalText>
                        This removes {count} conversation
                        {count === 1 ? "" : "s"} and everything in them,
                        permanently. Your resumes and profile are not affected.
                    </ModalText>
                    <ModalActions>
                        <CancelButton
                            type="button"
                            onClick={() => setConfirming(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </CancelButton>
                        <DangerButton
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting…" : "Delete everything"}
                        </DangerButton>
                    </ModalActions>
                </Modal>
            )}
        </section>
    );
};

export default ChatHistoryPanel;
