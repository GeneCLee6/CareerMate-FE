import { render, screen } from "@testing-library/react";
import { Trash2 } from "lucide-react";
import Icon, { ICON_SIZES, ICON_STROKE } from "./Icon";

describe("Icon", () => {
    it("renders at a size from the scale", () => {
        const { container } = render(<Icon icon={Trash2} size="lg" />);
        const svg = container.querySelector("svg");
        expect(svg).toHaveAttribute("width", String(ICON_SIZES.lg));
        expect(svg).toHaveAttribute("height", String(ICON_SIZES.lg));
    });

    it("defaults to the medium size", () => {
        const { container } = render(<Icon icon={Trash2} />);
        expect(container.querySelector("svg")).toHaveAttribute(
            "width",
            String(ICON_SIZES.md),
        );
    });

    it("always uses the shared stroke width", () => {
        // Cast past the type, which already forbids this, to prove the
        // component itself does not let a call site override the stroke.
        const props = { strokeWidth: 3 } as unknown as object;
        const { container } = render(<Icon icon={Trash2} {...props} />);
        expect(container.querySelector("svg")).toHaveAttribute(
            "stroke-width",
            String(ICON_STROKE),
        );
    });

    it("is hidden from screen readers when it has no label", () => {
        const { container } = render(<Icon icon={Trash2} />);
        expect(container.querySelector("svg")).toHaveAttribute(
            "aria-hidden",
            "true",
        );
    });

    it("is announced as an image when given a label", () => {
        render(<Icon icon={Trash2} label="Delete" />);
        expect(screen.getByRole("img", { name: "Delete" })).toBeInTheDocument();
    });
});
