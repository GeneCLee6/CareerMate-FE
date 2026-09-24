import type { LucideIcon, LucideProps } from "lucide-react";

/**
 * The only sizes an icon may be. Before this, each screen drew its own SVGs
 * at whatever size looked right in isolation — 12, 13, 15, 17, 18, 20 and 26
 * pixels, with three different stroke widths — so icons that sat side by side
 * never quite matched. Choosing from a short scale keeps them matching.
 */
export const ICON_SIZES = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
} as const;

/** One stroke width for every icon, at every size. */
export const ICON_STROKE = 1.75;

export type IconSize = keyof typeof ICON_SIZES;

export interface IconProps
    extends Omit<LucideProps, "size" | "ref" | "strokeWidth" | "absoluteStrokeWidth"> {
    /** A glyph from `lucide-react`, e.g. `Trash2`. */
    icon: LucideIcon;
    size?: IconSize;
    /**
     * Only for an icon that is the sole content of a control and has no text
     * next to it. Everywhere else the surrounding text already says what the
     * control does, and the icon stays hidden from screen readers.
     */
    label?: string;
}

/**
 * Renders a `lucide-react` glyph at a size from the scale, with the shared
 * stroke width. Colour comes from `currentColor`, so an icon takes the colour
 * of the text around it.
 */
const Icon = ({ icon: Glyph, size = "md", label, ...rest }: IconProps) => (
    <Glyph
        {...rest}
        // Set after the spread, so a call site cannot override the scale.
        size={ICON_SIZES[size]}
        strokeWidth={ICON_STROKE}
        focusable="false"
        {...(label
            ? { role: "img", "aria-label": label }
            : { "aria-hidden": true })}
    />
);

export default Icon;
