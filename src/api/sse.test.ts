import { createSseParser, SseEvent } from "./sse";

function collect() {
    const events: SseEvent[] = [];
    const parser = createSseParser((e) => events.push(e));
    return { events, parser };
}

describe("createSseParser", () => {
    it("reads an event and its data", () => {
        const { events, parser } = collect();
        parser.push('event: text\ndata: {"text":"Hi"}\n\n');
        expect(events).toEqual([{ event: "text", data: '{"text":"Hi"}' }]);
    });

    it("waits for the blank line when an event arrives in pieces", () => {
        const { events, parser } = collect();
        parser.push("event: te");
        parser.push('xt\ndata: {"te');
        expect(events).toEqual([]);
        parser.push('xt":"Hi"}\n');
        expect(events).toEqual([]);
        parser.push("\n");
        expect(events).toEqual([{ event: "text", data: '{"text":"Hi"}' }]);
    });

    it("splits several events that arrive together", () => {
        const { events, parser } = collect();
        parser.push("event: a\ndata: 1\n\nevent: b\ndata: 2\n\nevent: c\n");
        expect(events.map((e) => e.event)).toEqual(["a", "b"]);
    });

    it("skips the server's keep-alive comments", () => {
        const { events, parser } = collect();
        parser.push(": ping\n\nevent: done\ndata: {}\n\n");
        expect(events).toEqual([{ event: "done", data: "{}" }]);
    });

    it("accepts CRLF line endings", () => {
        const { events, parser } = collect();
        parser.push("event: text\r\ndata: x\r\n\r\n");
        expect(events).toEqual([{ event: "text", data: "x" }]);
    });

    it("defaults the event name to message", () => {
        const { events, parser } = collect();
        parser.push("data: hello\n\n");
        expect(events).toEqual([{ event: "message", data: "hello" }]);
    });
});
