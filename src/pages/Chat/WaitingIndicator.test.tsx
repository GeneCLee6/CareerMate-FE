import { act, render, screen } from "@testing-library/react";
import WaitingIndicator, { EXPLAIN_AFTER, SHOW_ELAPSED_AFTER } from "./WaitingIndicator";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const advance = (seconds: number) =>
    act(() => {
        jest.advanceTimersByTime(seconds * 1000);
    });

describe("WaitingIndicator", () => {
    it("shows the animated dots straight away", () => {
        render(<WaitingIndicator />);
        expect(screen.getByTestId("waiting-dots").children).toHaveLength(3);
    });

    it("tells screen readers once that the assistant is thinking", () => {
        render(<WaitingIndicator />);
        expect(screen.getByRole("status")).toHaveTextContent(
            "CareerMate AI is thinking"
        );
    });

    it("does not show the elapsed time at first", () => {
        render(<WaitingIndicator />);
        advance(SHOW_ELAPSED_AFTER - 1);
        expect(screen.queryByText(/^\d+s$/)).not.toBeInTheDocument();
    });

    it("shows the elapsed time after a few seconds, and keeps counting", () => {
        render(<WaitingIndicator />);
        advance(SHOW_ELAPSED_AFTER);
        expect(screen.getByText(`${SHOW_ELAPSED_AFTER}s`)).toBeInTheDocument();
        advance(3);
        expect(screen.getByText(`${SHOW_ELAPSED_AFTER + 3}s`)).toBeInTheDocument();
    });

    it("keeps the counter out of the live region, so it is not read every second", () => {
        render(<WaitingIndicator />);
        advance(SHOW_ELAPSED_AFTER);
        expect(screen.getByRole("status")).not.toHaveTextContent(/\d+s/);
    });

    it("explains a long wait", () => {
        render(<WaitingIndicator />);
        advance(EXPLAIN_AFTER - 1);
        expect(screen.queryByText(/server wakes up/)).not.toBeInTheDocument();
        advance(1);
        expect(screen.getByText(/server wakes up/)).toBeInTheDocument();
    });

    it("stops its timer when it goes away", () => {
        const { unmount } = render(<WaitingIndicator />);
        unmount();
        expect(jest.getTimerCount()).toBe(0);
    });
});
