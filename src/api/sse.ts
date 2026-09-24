/**
 * Parses server-sent events from text that arrives in arbitrary pieces.
 *
 * A network read can end anywhere — mid-line, mid-event, even mid-character
 * (the caller's TextDecoder handles that last one) — so text is buffered until
 * a blank line closes an event. Comment lines (starting with ":") are the
 * server's keep-alive and are skipped.
 *
 * `EventSource` would do this for us, but it only makes GET requests and
 * cannot send an Authorization header, so the stream is read by hand.
 */
export interface SseEvent {
    event: string;
    data: string;
}

export function createSseParser(onEvent: (event: SseEvent) => void) {
    let buffer = "";

    const dispatch = (block: string) => {
        let event = "message";
        const data: string[] = [];
        for (const line of block.split("\n")) {
            if (line === "" || line.startsWith(":")) continue;
            const colon = line.indexOf(":");
            const field = colon === -1 ? line : line.slice(0, colon);
            // One optional space after the colon is part of the syntax.
            const value =
                colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");
            if (field === "event") event = value;
            else if (field === "data") data.push(value);
        }
        if (data.length > 0) onEvent({ event, data: data.join("\n") });
    };

    return {
        /** Feeds newly arrived text; dispatches every event it completes. */
        push(text: string) {
            buffer += text.replace(/\r\n?/g, "\n");
            let end = buffer.indexOf("\n\n");
            while (end !== -1) {
                dispatch(buffer.slice(0, end));
                buffer = buffer.slice(end + 2);
                end = buffer.indexOf("\n\n");
            }
        },
    };
}
