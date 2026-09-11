/**
 * Design tokens.
 *
 * Two palettes live here on purpose. `colors` comes from the Zeplin file and
 * drives the auth screens; `landingColors` is the older landing page, which was
 * built from the original static site and uses slightly different values
 * (#000 headings rather than #161616, #e5e5e5 borders rather than #dfdfdf).
 * They are kept apart so neither silently restyles the other — merging them is
 * a design decision, not a refactor.
 */

/* ------------------------------------------------------------------ *
 * Auth screens (Zeplin)
 * ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ *
 * Landing page
 * ------------------------------------------------------------------ */

export const landingColors = {
    heading: "#000",
    /** Hover state of the solid black buttons. */
    headingHover: "#333",
    body: "#333",
    muted: "#666",
    surface: "#fff",
    /** Problem cards. */
    surfaceSubtle: "#f5f5f5",
    /** Feature cards. */
    surfaceCard: "#f5f5f7",
    /** Contact section. */
    surfaceContact: "#f9fafc",
    /** Footer, and the top of the hero gradient. */
    surfaceFooter: "#fafafa",
    border: "#e5e5e5",
    borderDashed: "#e0e0e0",
    onGradient: "#fff",
    onGradientMuted: "#cedaff",
    danger: "#ff0000",
    success: "#16a34a",
    placeholder: "#ccc",
} as const;

export const landingGradients = {
    /** Hero button and the closing CTA. */
    primary: gradient,
    /** The solution card leans a little steeper. */
    card: "linear-gradient(137deg, #504ffd 6%, #40c3fb 96%)",
    /** Hero backdrop. */
    hero: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
} as const;

export const landingLayout = {
    /** Padding shared by most landing sections. */
    sectionPadding: "100px 40px",
    contentMaxWidth: "1400px",
    contentMaxWidthNarrow: "1200px",
    /** Width below which the two-column sections stack. */
    mobile: "768px",
} as const;
