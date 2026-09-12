import { render, screen } from "@testing-library/react";
import Avatar from "./Avatar";

describe("Avatar", () => {
    it("shows the initials of the first two words", () => {
        render(<Avatar name="Ray Zhang" />);
        expect(screen.getByText("RZ")).toBeInTheDocument();
    });

    it("uses one letter for a single-word name", () => {
        render(<Avatar name="Ray" />);
        expect(screen.getByText("R")).toBeInTheDocument();
    });

    it("ignores extra whitespace between words", () => {
        render(<Avatar name="  Ray   Zhang  " />);
        expect(screen.getByText("RZ")).toBeInTheDocument();
    });

    it("renders the image when there is one", () => {
        // Queried through the DOM rather than by role: the image is
        // decorative (empty alt, aria-hidden wrapper) because the name it
        // stands for is already on screen beside it.
        const { container } = render(
            <Avatar name="Ray Zhang" src="https://cdn.example/a.png" />
        );
        expect(container.querySelector("img")).toHaveAttribute(
            "src",
            "https://cdn.example/a.png"
        );
    });

    // The avatar endpoint used to answer with only { avatar }, so the client
    // replaced its user object with that one field and every screen carrying a
    // header crashed on `undefined.trim()`. The backend now returns the whole
    // user; this makes sure a partial one can never take a page down again.
    it("survives a missing name rather than crashing the page", () => {
        expect(() =>
            render(<Avatar name={undefined} />)
        ).not.toThrow();
    });

    it("survives a null name", () => {
        expect(() => render(<Avatar name={null} />)).not.toThrow();
    });

    it("survives an empty name", () => {
        expect(() => render(<Avatar name="" />)).not.toThrow();
    });
});
