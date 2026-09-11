import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OtpInput from "./OtpInput";

/** Wraps the controlled component so typing behaves like it does in the page. */
const Harness = ({ length = 6 }: { length?: number }) => {
    const [value, setValue] = useState("");
    return (
        <>
            <OtpInput value={value} onChange={setValue} length={length} />
            <output data-testid="value">{value}</output>
        </>
    );
};

const boxes = () => screen.getAllByRole("textbox") as HTMLInputElement[];
const currentValue = () => screen.getByTestId("value").textContent;

describe("OtpInput", () => {
    it("renders one box per digit", () => {
        render(<Harness />);
        expect(boxes()).toHaveLength(6);
    });

    it("advances focus as digits are typed", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.click(boxes()[0]);
        await user.keyboard("134");

        expect(currentValue()).toBe("134");
        expect(boxes()[3]).toHaveFocus();
    });

    it("ignores non-digits", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.click(boxes()[0]);
        await user.keyboard("1a2");

        expect(currentValue()).toBe("12");
    });

    it("spreads a pasted code across the boxes", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.click(boxes()[0]);
        await user.paste("134876");

        expect(currentValue()).toBe("134876");
        expect(boxes().map((b) => b.value)).toEqual([
            "1",
            "3",
            "4",
            "8",
            "7",
            "6",
        ]);
    });

    it("never takes more digits than it has boxes", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.click(boxes()[0]);
        await user.paste("1234567890");

        expect(currentValue()).toBe("123456");
    });

    it("strips separators out of a pasted code", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.click(boxes()[0]);
        await user.paste("134 876");

        expect(currentValue()).toBe("134876");
    });

    it("steps back and clears on backspace in an empty box", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.click(boxes()[0]);
        await user.keyboard("13");
        // Focus sits on the third box, which is empty.
        await user.keyboard("{Backspace}");

        expect(currentValue()).toBe("1");
        expect(boxes()[1]).toHaveFocus();
    });

    it("moves between boxes with the arrow keys", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.click(boxes()[2]);
        await user.keyboard("{ArrowLeft}");
        expect(boxes()[1]).toHaveFocus();

        await user.keyboard("{ArrowRight}{ArrowRight}");
        expect(boxes()[3]).toHaveFocus();
    });

    it("marks every box invalid so the whole code reads as rejected", () => {
        render(<OtpInput value="134" onChange={() => {}} invalid />);
        boxes().forEach((box) =>
            expect(box).toHaveAttribute("aria-invalid", "true")
        );
    });
});
