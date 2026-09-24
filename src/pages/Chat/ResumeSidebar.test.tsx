import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ResumeSidebar, { ResumeSidebarProps } from "./ResumeSidebar";
import { Resume } from "../../api/resumes";
import { User } from "../../api/auth";

const user: User = {
    id: "u1",
    email: "gene@example.com",
    fullName: "Gene Lee",
    field: "Frontend",
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
};

function makeResume(overrides: Partial<Resume> = {}): Resume {
    return {
        id: "r1",
        fileKey: "resume/u1/r1.pdf",
        fileName: "Gene_Resume_2026.pdf",
        fileSize: 120_000,
        textStatus: "ok",
        createdAt: "2026-09-10T00:00:00Z",
        updatedAt: "2026-09-10T00:00:00Z",
        ...overrides,
    };
}

function renderSidebar(overrides: Partial<ResumeSidebarProps> = {}) {
    const props: ResumeSidebarProps = {
        user,
        resumes: [],
        uploading: false,
        onUpload: jest.fn(),
        onDelete: jest.fn(),
        uploadingName: null,
        uploadProgress: 0,
        conversations: [],
        activeConversationId: null,
        onOpenConversation: jest.fn(),
        onNewConversation: jest.fn(),
        onDownloadResume: jest.fn(),
        uploadError: null,
        open: false,
        onClose: jest.fn(),
        ...overrides,
    };
    render(
        <MemoryRouter>
            <ResumeSidebar {...props} />
        </MemoryRouter>
    );
    return props;
}

describe("ResumeSidebar", () => {
    it("starts a new chat from the small button beside the Chats heading", async () => {
        const props = renderSidebar();
        await userEvent.click(screen.getByRole("button", { name: "New chat" }));
        expect(props.onNewConversation).toHaveBeenCalled();
    });

    it("lists conversations and marks the open one", async () => {
        const props = renderSidebar({
            conversations: [
                { id: "c1", title: "Resume review", lastMessageAt: "", createdAt: "" },
                { id: "c2", title: "Atlassian interview", lastMessageAt: "", createdAt: "" },
            ],
            activeConversationId: "c1",
        });
        expect(screen.getByRole("button", { name: "Resume review" })).toHaveAttribute(
            "aria-current",
            "true"
        );
        await userEvent.click(screen.getByRole("button", { name: "Atlassian interview" }));
        expect(props.onOpenConversation).toHaveBeenCalledWith("c2");
    });

    it("offers a prominent upload when there is no resume", () => {
        renderSidebar();
        expect(
            screen.getByRole("button", { name: /upload your resume/i })
        ).toBeInTheDocument();
    });

    it.each([
        ["ok", "Read by the assistant"],
        ["empty", "No text — scanned PDF?"],
        ["failed", "Couldn't be read"],
        ["pending", "Read when you next ask"],
    ] as const)("says in words whether the assistant can read a %s resume", (status, text) => {
        renderSidebar({ resumes: [makeResume({ textStatus: status })] });
        expect(screen.getByText(text)).toBeInTheDocument();
    });

    it("keeps the actions menu button visible and downloads from it", async () => {
        const props = renderSidebar({ resumes: [makeResume()] });
        const menuButton = screen.getByRole("button", {
            name: "Actions for Gene_Resume_2026.pdf",
        });
        expect(menuButton).toBeVisible();
        expect(menuButton).toHaveAttribute("aria-expanded", "false");

        await userEvent.click(menuButton);
        expect(menuButton).toHaveAttribute("aria-expanded", "true");
        await userEvent.click(screen.getByRole("menuitem", { name: "Download" }));

        expect(props.onDownloadResume).toHaveBeenCalledWith(
            expect.objectContaining({ id: "r1" })
        );
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes the menu on Escape and returns focus to its button", async () => {
        renderSidebar({ resumes: [makeResume()] });
        const menuButton = screen.getByRole("button", {
            name: "Actions for Gene_Resume_2026.pdf",
        });
        await userEvent.click(menuButton);
        await userEvent.keyboard("{Escape}");
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        expect(menuButton).toHaveFocus();
    });

    it("asks before deleting, and deletes only on confirmation", async () => {
        const props = renderSidebar({ resumes: [makeResume()] });
        await userEvent.click(
            screen.getByRole("button", { name: "Actions for Gene_Resume_2026.pdf" })
        );
        await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));

        const dialog = screen.getByRole("dialog", { name: "Delete this resume?" });
        expect(props.onDelete).not.toHaveBeenCalled();

        await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
        expect(props.onDelete).toHaveBeenCalledWith(
            expect.objectContaining({ id: "r1" })
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not delete when the confirmation is cancelled", async () => {
        const props = renderSidebar({ resumes: [makeResume()] });
        await userEvent.click(
            screen.getByRole("button", { name: "Actions for Gene_Resume_2026.pdf" })
        );
        await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(props.onDelete).not.toHaveBeenCalled();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("shows the user with their field and a link to settings", () => {
        renderSidebar();
        expect(screen.getByText("Gene Lee")).toBeInTheDocument();
        expect(screen.getByText("Frontend")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
            "href",
            "/settings"
        );
    });
});
