import { render, screen } from "@testing-library/react";
import StreamingReply, { THINKING_TAIL } from "./StreamingReply";

describe("StreamingReply", () => {
    it("shows the waiting indicator before anything arrives", () => {
        render(<StreamingReply thinking="" text="" />);
        expect(screen.getByTestId("waiting-dots")).toBeInTheDocument();
        expect(screen.queryByTestId("thinking-summary")).not.toBeInTheDocument();
    });

    it("shows what the model is thinking while it has not started answering", () => {
        render(<StreamingReply thinking="Comparing the resume with the role." text="" />);
        expect(screen.getByTestId("thinking-summary")).toHaveTextContent(
            "Comparing the resume with the role."
        );
    });

    it("shows only the latest part of a long reasoning summary", () => {
        const long = `${"early words ".repeat(40)}the latest step`;
        render(<StreamingReply thinking={long} text="" />);
        const shown = screen.getByTestId("thinking-summary").textContent ?? "";
        expect(shown.startsWith("…")).toBe(true);
        expect(shown.length).toBeLessThanOrEqual(THINKING_TAIL + 1);
        expect(shown).toContain("the latest step");
    });

    it("shows the answer instead once it starts", () => {
        render(<StreamingReply thinking="Reasoning." text="Start with metrics" />);
        expect(screen.getByText("Start with metrics")).toBeInTheDocument();
        expect(screen.queryByTestId("waiting-dots")).not.toBeInTheDocument();
        expect(screen.queryByTestId("thinking-summary")).not.toBeInTheDocument();
    });
});
