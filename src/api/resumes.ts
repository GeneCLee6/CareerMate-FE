import { putWithProgress } from "./upload";
import { apiClient, SuccessData } from "./client";

/**
 * Whether the assistant can read a resume's text. `pending` is a resume
 * uploaded before extraction existed; it is read the next time the assistant
 * needs it. `empty` is a PDF with no text layer, such as a scan.
 */
export type ResumeTextStatus = "pending" | "ok" | "empty" | "failed";

export interface Resume {
    id: string;
    fileKey: string;
    fileName: string;
    fileSize: number;
    /** Absent only from responses older than text extraction. */
    textStatus?: ResumeTextStatus;
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
    category: UploadCategory,
    onProgress?: (fraction: number) => void
): Promise<string> {
    const { uploadUrl, fileKey } = await getPresignedUrl(file, category);

    await putWithProgress(uploadUrl, file, onProgress);

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
export async function uploadResume(
    file: File,
    onProgress?: (fraction: number) => void
): Promise<Resume> {
    const fileKey = await uploadFile(file, "resume", onProgress);
    return createResume(fileKey, file.name);
}
