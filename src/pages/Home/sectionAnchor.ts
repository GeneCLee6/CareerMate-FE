/**
 * Turns a landing-page section id into a link that works from anywhere.
 *
 * The navbar and footer are shared with the legal pages now, and "#features"
 * on /privacy points at a section that is not on the page — a dead link of
 * exactly the kind those pages were added to remove. From another route the
 * link has to carry the path as well.
 *
 * Returns a plain href rather than a router path: the browser's own handling
 * of a fragment is what scrolls to the section, and Home restores that on
 * arrival.
 */
export function sectionAnchor(pathname: string, id: string): string {
    return pathname === "/" ? `#${id}` : `/#${id}`;
}
