import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatHistoryPanel from "./ChatHistoryPanel";
import * as chatApi from "../../api/chat";
import { ApiError } from "../../api/client";

jest.mock("../../api/chat");

const mockToast = jest.fn();
jest.mock("../../components/Toast", () => ({
    useToast: () => mockToast,
}));

const getConversations = chatApi.getConversations as jest.MockedFunction<
    typeof chatApi.getConversations
>;
const deleteAllConversations =
    chatApi.deleteAllConversations as jest.MockedFunction<
        typeof chatApi.deleteAllConversations
    >;

const conversation = (id: string) => ({
    id,
    title: `Conversation ${id}`,
    lastMessageAt: "2026-09-12T00:00:00.000Z",
    createdAt: "2026-09-12T00:00:00.000Z",
});

beforeEach(() => {
    jest.clearAllMocks();
    getConversations.mockResolvedValue([conversation("a"), conversation("b")]);
    deleteAllConversations.mockResolvedValue({
        conversations: 2,
        messages: 14,
    });
});

describe("ChatHistoryPanel", () => {
    it("says how many conversations there are", async () => {
        render(<ChatHistoryPanel />);
        expect(await screen.findByText("2")).toBeInTheDocument();
    });

    it("explains why deleting has to happen here", async () => {
        // The assistant only opens the most recent conversation, so this is
        // the only route to the older ones.
        render(<ChatHistoryPanel />);
        expect(
            await screen.findByText(/only opens your\s+most recent one/)
        ).toBeInTheDocument();
    });

    it("disables the button when there is nothing to delete", async () => {
        getConversations.mockResolvedValue([]);
        render(<ChatHistoryPanel />);

        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: "Delete all chat history" })
            ).toBeDisabled()
        );
    });

    it("asks before deleting anything", async () => {
        const user = userEvent.setup();
        render(<ChatHistoryPanel />);
        await screen.findByText("2");

        await user.click(
            screen.getByRole("button", { name: "Delete all chat history" })
        );

        expect(screen.getByText("Delete all chat history?")).toBeInTheDocument();
        expect(deleteAllConversations).not.toHaveBeenCalled();
    });

    it("does nothing if the confirmation is dismissed", async () => {
        const user = userEvent.setup();
        render(<ChatHistoryPanel />);
        await screen.findByText("2");

        await user.click(
            screen.getByRole("button", { name: "Delete all chat history" })
        );
        await user.click(screen.getByRole("button", { name: "Cancel" }));

        expect(deleteAllConversations).not.toHaveBeenCalled();
    });

    it("says what was actually removed, not just 'done'", async () => {
        const user = userEvent.setup();
        render(<ChatHistoryPanel />);
        await screen.findByText("2");

        await user.click(
            screen.getByRole("button", { name: "Delete all chat history" })
        );
        await user.click(
            screen.getByRole("button", { name: "Delete everything" })
        );

        await waitFor(() => expect(deleteAllConversations).toHaveBeenCalled());
        expect(mockToast).toHaveBeenCalledWith(
            "Deleted 2 conversations and 14 messages"
        );
    });

    it("gets the singular right", async () => {
        const user = userEvent.setup();
        getConversations.mockResolvedValue([conversation("a")]);
        deleteAllConversations.mockResolvedValue({
            conversations: 1,
            messages: 1,
        });
        render(<ChatHistoryPanel />);
        await screen.findByText("1");

        await user.click(
            screen.getByRole("button", { name: "Delete all chat history" })
        );
        await user.click(
            screen.getByRole("button", { name: "Delete everything" })
        );

        await waitFor(() =>
            expect(mockToast).toHaveBeenCalledWith(
                "Deleted 1 conversation and 1 message"
            )
        );
    });

    it("reports a failure instead of pretending it worked", async () => {
        const user = userEvent.setup();
        deleteAllConversations.mockRejectedValue(
            new ApiError("Something unexpected happened", 500)
        );
        render(<ChatHistoryPanel />);
        await screen.findByText("2");

        await user.click(
            screen.getByRole("button", { name: "Delete all chat history" })
        );
        await user.click(
            screen.getByRole("button", { name: "Delete everything" })
        );

        expect(
            await screen.findByText("Something unexpected happened")
        ).toBeInTheDocument();
    });

    it("still offers deletion when the count cannot be fetched", async () => {
        // Failing to count is not a reason to hide the control.
        getConversations.mockRejectedValue(new ApiError("offline", 0, true));
        render(<ChatHistoryPanel />);

        expect(
            await screen.findByText("You have no saved conversations.")
        ).toBeInTheDocument();
    });
});
