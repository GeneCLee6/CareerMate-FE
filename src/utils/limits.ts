/**
 * Mirrors `CareerMate-BE/src/utils/limits.js`.
 *
 * The backend is the source of truth — these values exist so the user sees the
 * design's inline message while typing, instead of a round-trip 400 after
 * pressing submit. If the backend's limits change, change these too; they are
 * deliberately the same numbers rather than something stricter, so the two
 * cannot disagree about whether a given value is acceptable.
 */
export const LIMITS = {
    EMAIL: 254,
    FULL_NAME: 100,
    DISPLAY_NAME: 50,
    GOAL: 500,
} as const;
