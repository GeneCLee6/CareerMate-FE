import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { colors } from "../../styles/tokens";

/** Seconds before the elapsed time appears. Sooner reads as impatience. */
export const SHOW_ELAPSED_AFTER = 5;

/**
 * Seconds before the wait is explained. The backend sleeps when idle and
 * takes up to a minute to wake, so a long first reply is expected, not a
 * fault — and saying so is better than leaving the user to guess.
 */
export const EXPLAIN_AFTER = 15;

const bounce = keyframes`
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
    }
    30% {
        transform: translateY(-4px);
        opacity: 1;
    }
`;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 21px;
`;

const Dots = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
`;

/*
 * One animation, started at three offsets: each dot rises a moment after the
 * one before it, which reads as a wave rather than a blink.
 */
const Dot = styled.span<{ $delay: number }>`
    width: 7px;
    height: 7px;
    background-color: #7a7f8c;
    border-radius: 50%;
    animation: ${bounce} 1.2s ease-in-out infinite;
    animation-delay: ${({ $delay }) => $delay}ms;

    /* Some people turn motion off because it makes them unwell. */
    @media (prefers-reduced-motion: reduce) {
        animation: none;
        opacity: 0.6;
    }
`;

const Elapsed = styled.span`
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${colors.textMuted};
`;

const Explanation = styled.p`
    margin: 0;
    max-width: 320px;
    font-size: 12px;
    line-height: 1.5;
    color: ${colors.textMuted};
    white-space: normal;
`;

/** Read by screen readers, invisible on screen. */
const ScreenReaderOnly = styled.span`
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
`;

/** Whole seconds since the component mounted, updated once a second. */
function useElapsedSeconds(): number {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        // Measured from a start time rather than counted in ticks, so a
        // throttled background tab still shows the true wait when it returns.
        const start = Date.now();
        const id = window.setInterval(() => {
            setElapsed(Math.floor((Date.now() - start) / 1000));
        }, 1000);
        return () => window.clearInterval(id);
    }, []);
    return elapsed;
}

/**
 * Shown in the assistant's bubble from the moment a message is sent until
 * the reply begins. It says the system is working (the dots), how long it
 * has been (after a few seconds), and why a long wait is normal (after
 * longer).
 */
export interface WaitingIndicatorProps {
    /**
     * Whether a long wait may still be the server waking up. Once anything
     * has arrived from the model, the server is clearly awake, and saying
     * otherwise would mislead.
     */
    mayBeWaking?: boolean;
}

const WaitingIndicator = ({ mayBeWaking = true }: WaitingIndicatorProps) => {
    const elapsed = useElapsedSeconds();

    return (
        <Wrapper>
            {/* Announced once. The counter below changes every second, and a
                live region around it would read every number aloud. */}
            <ScreenReaderOnly role="status">CareerMate AI is thinking</ScreenReaderOnly>
            <Row aria-hidden="true">
                <Dots data-testid="waiting-dots">
                    <Dot $delay={0} />
                    <Dot $delay={160} />
                    <Dot $delay={320} />
                </Dots>
                {elapsed >= SHOW_ELAPSED_AFTER && <Elapsed>{elapsed}s</Elapsed>}
            </Row>
            {mayBeWaking && elapsed >= EXPLAIN_AFTER && (
                <Explanation>
                    Still working on it. The first reply after a quiet spell can
                    take up to a minute while the server wakes up.
                </Explanation>
            )}
        </Wrapper>
    );
};

export default WaitingIndicator;
