/**
 * Design tokens taken from the Zeplin auth screens.
 *
 * These are scoped to the auth flow on purpose — the landing page predates the
 * Zeplin file and keeps its own styling.
 */

export const colors = {
    text: "#161616",
    textMuted: "#898989",
    label: "#595959",
    placeholder: "#b5b5b5",
    border: "#dfdfdf",
    borderFocus: "#504ffd",
    surface: "#ffffff",
    link: "#2f6bff",
    danger: "#ff3232",
    dangerSurface: "#ffeaea",
    warning: "#ffa726",
    toast: "#3e3e3e",
} as const;

export const gradient = "linear-gradient(110deg, #504ffd 11%, #40c3fb 92%)";

/** Inter is the Zeplin typeface; the fallback keeps the page readable offline. */
export const fontFamily =
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** Form column width and control height from the design (440 x 48). */
export const control = {
    width: "440px",
    height: "48px",
    radius: "24px",
} as const;
