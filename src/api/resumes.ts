import { ApiError, apiClient, SuccessData } from "./client";

export interface Resume {
    id: string;
    fileKey: string;
    fileName: string;
    fileSize: number;
    createdAt: string;
    updatedAt: string;
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
        throw new ApiError("Network error, please try again later.", 0, true);
    }

    if (!response.ok) {
        throw new ApiError("Upload failed. Please try again.", response.status);
    }

    return fileKey;
}

export function createResume(fileKey: string, fileName: string): Promise<Resume> {
    return apiClient
        .post<SuccessData<Resume>>("/resumes", { fileKey, fileName })
        .then((res) => res.data);
}

export function getResumes(): Promise<Resume[]> {
    return apiClient
        .get<SuccessData<Resume[]>>("/resumes")
        .then((res) => res.data);
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
