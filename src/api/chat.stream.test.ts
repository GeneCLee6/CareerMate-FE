import { streamMessage } from "./chat";
import { ApiError, setAuthToken, setSessionExpiredHandler } from "./client";

const encoder = new TextEncoder();

/** A fetch Response whose body yields `chunks` one read at a time. */
function streamedResponse(chunks: string[], status = 200): Response {
    const queue = chunks.map((c) => encoder.encode(c));
    return {
        ok: status >= 200 && status < 300,
        status,
        body: {
            getReader: () => ({
                read: async () =>
                    queue.length
                        ? { value: queue.shift(), done: false }
                        : { value: undefined, done: true },
            }),
        },
        json: async () => ({}),
    } as unknown as Response;
}

const sse = (event: string, data: unknown) =>
    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

const conversation = { id: "c1", title: "Hi", lastMessageAt: "", createdAt: "" };
const userMessage = { id: "m1", conversation: "c1", role: "user", content: "Hi", createdAt: "" };
const assistantMessage = {
    id: "m2",
    conversation: "c1",
    role: "assistant",
    content: "Hello there.",
    createdAt: "",
};

let fetchMock: jest.Mock;

beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    setAuthToken("token-1");
});

afterEach(() => {
    setAuthToken(null);
    setSessionExpiredHandler(null);
});

describe("streamMessage", () => {
    it("hands over thinking and text, then resolves with the stored turns", async () => {
        const all =
            sse("start", { conversation, userMessage }) +
            sse("thinking", { text: "Reading. " }) +
            sse("text", { text: "Hello " }) +
            sse("text", { text: "there." }) +
            sse("done", { conversation, userMessage, assistantMessage });
        // Cut the stream at awkward places, as the network does.
        fetchMock.mockResolvedValue(
            streamedResponse([all.slice(0, 17), all.slice(17, 90), all.slice(90)])
        );
        const onStart = jest.fn();
        const thinking: string[] = [];
        const text: string[] = [];

        const result = await streamMessage("Hi", undefined, undefined, {
            onStart,
            onThinking: (t) => thinking.push(t),
            onText: (t) => text.push(t),
        });

        expect(onStart).toHaveBeenCalledWith({ conversation, userMessage });
        expect(thinking).toEqual(["Reading. "]);
        expect(text).toEqual(["Hello ", "there."]);
        expect(result.assistantMessage.content).toBe("Hello there.");
    });

    it("posts to the stream endpoint with the session token", async () => {
        fetchMock.mockResolvedValue(
            streamedResponse([sse("done", { conversation, userMessage, assistantMessage })])
        );

        await streamMessage("Hi", "c1", undefined);

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toMatch(/\/chat\/conversations\/c1\/messages\/stream$/);
        expect(init.method).toBe("POST");
        expect(init.headers.Authorization).toBe("Bearer token-1");
        expect(JSON.parse(init.body)).toEqual({ content: "Hi" });
    });

    it("rejects with the server's message when it reports an error", async () => {
        fetchMock.mockResolvedValue(
            streamedResponse([
                sse("start", { conversation, userMessage }),
                sse("text", { text: "Half" }),
                sse("error", { status: 502, message: "The assistant is unavailable." }),
            ])
        );

        const error = await streamMessage("Hi", undefined, undefined).catch((e) => e);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toBe("The assistant is unavailable.");
        expect(error.status).toBe(502);
    });

    it("rejects when the connection ends before the reply finishes", async () => {
        fetchMock.mockResolvedValue(
            streamedResponse([sse("start", { conversation, userMessage }), sse("text", { text: "Ha" })])
        );

        await expect(streamMessage("Hi", undefined, undefined)).rejects.toThrow(
            /closed before the reply finished/
        );
    });

    it("treats an error before the stream opens like any other request", async () => {
        const expired = jest.fn();
        setSessionExpiredHandler(expired);
        fetchMock.mockResolvedValue({
            ok: false,
            status: 401,
            json: async () => ({ success: false, error: { message: "Session expired" } }),
        } as unknown as Response);

        await expect(streamMessage("Hi", undefined, undefined)).rejects.toMatchObject({
            status: 401,
            message: "Session expired",
        });
        expect(expired).toHaveBeenCalled();
    });
});
