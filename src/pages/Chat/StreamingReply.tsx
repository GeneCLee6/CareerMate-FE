import styled, { keyframes } from "styled-components";
import WaitingIndicator from "./WaitingIndicator";
import { colors } from "../../styles/tokens";

/** How much of the reasoning summary to show: its latest words, not all of it. */
export const THINKING_TAIL = 160;

const blink = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
`;

const Thinking = styled.p`
    margin: 6px 0 0;
    max-width: 420px;
    font-size: 12px;
    font-style: italic;
    line-height: 1.5;
    color: ${colors.textMuted};
    white-space: normal;
`;

/** Marks the end of text that is still being written. */
const Caret = styled.span`
    display: inline-block;
    width: 7px;
    height: 1em;
    margin-left: 2px;
    vertical-align: text-bottom;
    background-color: ${colors.label};
    border-radius: 1px;
    animation: ${blink} 1s steps(1) infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`;

export interface StreamingReplyProps {
    /** The reasoning summary so far. */
    thinking: string;
    /** The answer so far. */
    text: string;
}

/**
 * The assistant's bubble while a reply streams in. Before the answer starts
 * it shows the waiting indicator and the latest line of the model's
 * reasoning, so a long think reads as work rather than a stall; once the
 * answer starts, it shows the answer as it grows.
 */
const StreamingReply = ({ thinking, text }: StreamingReplyProps) => {
    if (text) {
        return (
            <>
                {text}
                <Caret aria-hidden="true" />
            </>
        );
    }

    const summary = thinking.trim();
    const tail =
        summary.length > THINKING_TAIL
            ? `…${summary.slice(-THINKING_TAIL).replace(/^\S*\s/, "")}`
            : summary;

    return (
        <>
            {/* Thinking has arrived, so the server is awake: no wake-up note. */}
            <WaitingIndicator mayBeWaking={!summary} />
            {tail && <Thinking data-testid="thinking-summary">{tail}</Thinking>}
        </>
    );
};

export default StreamingReply;
