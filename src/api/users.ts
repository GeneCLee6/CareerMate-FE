import { apiClient, SuccessData, SuccessMessage } from "./client";
import { User } from "./auth";

/** Matches the backend's updateMeSchema. */
export interface UpdateProfileInput {
    fullName: string;
    displayName?: string;
    role?: "Student" | "Other";
    field?: "FE" | "BE";
    goal?: string;
}

export function getMe(): Promise<User> {
    return apiClient
        .get<SuccessData<User>>("/users/me")
        .then((res) => res.data);
}

export function updateProfile(input: UpdateProfileInput): Promise<User> {
    return apiClient
        .put<SuccessData<User>>("/users/me", input)
        .then((res) => res.data);
}

export function updatePassword(input: {
    currentPassword: string;
    newPassword: string;
}): Promise<string> {
    return apiClient
        .put<SuccessMessage>("/users/me/password", input)
        .then((res) => res.message);
}

/** `fileKey` is the tmp/ key returned when the file was uploaded to S3. */
export function updateAvatar(fileKey: string): Promise<User> {
    return apiClient
        .post<SuccessData<User>>("/users/me/avatar", { fileKey })
        .then((res) => res.data);
}
