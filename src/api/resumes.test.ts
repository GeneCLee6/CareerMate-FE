import { createResume, getResumes } from "./resumes";
import { setAuthToken } from "./client";

const fetchMock = jest.fn();

/** Shaped like a real Mongoose document: `_id`, no `id` virtual. */
const rawResume = (id: string, fileName = "cv.pdf") => ({
    _id: id,
    user: "6aa425ac8058422241cff7cf",
    fileKey: `resume/u/${id}.pdf`,
    fileName,
    fileSize: 220,
    createdAt: "2026-09-11T16:01:20.531Z",
    updatedAt: "2026-09-11T16:01:20.531Z",
    __v: 0,
});

function ok(body: unknown, status = 200) {
    return { ok: true, status, json: async () => body } as Response;
}

beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    setAuthToken("tok");
});

describe("resume id normalisation", () => {
    // The Resume model has no toJSON virtuals, so documents arrive with _id
    // only. Without this the delete button would call /resumes/undefined.
    it("gives a listed resume an id taken from _id", async () => {
        fetchMock.mockResolvedValue(
            ok({ success: true, data: [rawResume("6aa425d08058422241cff7d0")] })
        );

        const [resume] = await getResumes();

        expect(resume.id).toBe("6aa425d08058422241cff7d0");
    });

    it("gives a newly created resume an id", async () => {
        fetchMock.mockResolvedValue(
            ok(
                { success: true, data: rawResume("6aa425d08058422241cff7d1") },
                201
            )
        );

        const resume = await createResume("tmp/u/x.pdf", "cv.pdf");

        expect(resume.id).toBe("6aa425d08058422241cff7d1");
    });

    it("keeps an id the API already provided", async () => {
        // Tolerates the backend later adding the virtual.
        fetchMock.mockResolvedValue(
            ok({
                success: true,
                data: [{ ...rawResume("raw"), id: "virtual-id" }],
            })
        );

        const [resume] = await getResumes();

        expect(resume.id).toBe("virtual-id");
    });

    it("drops _id so it cannot be mistaken for the id", async () => {
        fetchMock.mockResolvedValue(
            ok({ success: true, data: [rawResume("abc")] })
        );

        const [resume] = await getResumes();

        expect(resume).not.toHaveProperty("_id");
    });

    it("carries the rest of the document through", async () => {
        fetchMock.mockResolvedValue(
            ok({ success: true, data: [rawResume("abc", "my-cv.pdf")] })
        );

        const [resume] = await getResumes();

        expect(resume).toMatchObject({
            fileName: "my-cv.pdf",
            fileSize: 220,
            fileKey: "resume/u/abc.pdf",
        });
    });

    it("handles an empty list", async () => {
        fetchMock.mockResolvedValue(ok({ success: true, data: [] }));
        await expect(getResumes()).resolves.toEqual([]);
    });
});
