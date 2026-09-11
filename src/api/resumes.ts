import { ApiError, apiClient, SuccessData } from "./client";

export interface Resume {
    id: string;
    fileKey: string;
    fileName: string;
    fileSize: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * As the API sends it. The Resume model has no `id` virtual — unlike User,
 * which sets toJSON:{virtuals:true} — so documents arrive with `_id` only.
 */
type RawResume = Omit<Resume, "id"> & { _id?: string; id?: string };

/** Gives every resume a usable `id` whichever field the API populated. */
function normaliseResume(raw: RawResume): Resume {
    const { _id, id, ...rest } = raw;
    return { ...rest, id: id ?? _id ?? "" };
}

interface PresignedUpload {
    uploadUrl: string;
    fileKey: string;
    expiresIn: number;
}

export type UploadCategory = "avatar" | "resume";

/** Step one of an upload: ask the API where to put the file. */
function getPresignedUrl(
    file: File,
    category: UploadCategory
): Promise<PresignedUpload> {
    return apiClient
        .post<SuccessData<PresignedUpload>>("/upload/presigned-url", {
            fileName: file.name,
            contentType: file.type,
            category,
            fileSize: file.size,
        })
        .then((res) => res.data);
}

/**
 * Uploads a file straight to S3 and returns the tmp/ key the API hands back.
 * The PUT goes to S3, not our API, so it does not use the shared client.
 */
export async function uploadFile(
    file: File,
    category: UploadCategory
): Promise<string> {
    const { uploadUrl, fileKey } = await getPresignedUrl(file, category);

    let response: Response;
    try {
        response = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });
    } catch {
        // The browser reports a blocked cross-origin request and a genuinely
        // unreachable host identically, as an opaque TypeError. Reaching here
        // after the API happily issued the URL nearly always means the storage
        // bucket has no CORS rule for this origin, so say where to look.
        console.error(
            "Upload to storage failed before it got a response. The API issued " +
                "the upload URL, so the bucket most likely has no CORS rule " +
                `allowing PUT from ${window.location.origin}.`
        );
        throw new ApiError(
            "Could not reach file storage. Please try again.",
            0,
            true
        );
    }

    if (!response.ok) {
        throw new ApiError("Upload failed. Please try again.", response.status);
    }

    return fileKey;
}

export function createResume(
    fileKey: string,
    fileName: string
): Promise<Resume> {
    return apiClient
        .post<SuccessData<RawResume>>("/resumes", { fileKey, fileName })
        .then((res) => normaliseResume(res.data));
}

export function getResumes(): Promise<Resume[]> {
    return apiClient
        .get<SuccessData<RawResume[]>>("/resumes")
        .then((res) => res.data.map(normaliseResume));
}

export function deleteResume(id: string): Promise<void> {
    return apiClient.delete<void>(`/resumes/${id}`);
}

export function getResumeDownloadUrl(id: string): Promise<string> {
    return apiClient
        .get<SuccessData<{ downloadUrl: string }>>(`/resumes/${id}/download`)
        .then((res) => res.data.downloadUrl);
}

/** Uploads the file and registers it as the user's resume in one step. */
export async function uploadResume(file: File): Promise<Resume> {
    const fileKey = await uploadFile(file, "resume");
    return createResume(fileKey, file.name);
}
