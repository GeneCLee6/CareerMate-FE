import { FormEvent, useState } from "react";
import TextField from "../../components/TextField";
import AlertBanner from "../../components/AlertBanner";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import { updateProfile } from "../../api/users";
import {
    validateDisplayName,
    validateFullName,
} from "../../utils/validators";
import { LIMITS } from "../../utils/limits";
import {
    PanelForm,
    PanelTitle,
    SaveButton,
    settingsInputRadius,
} from "./settingsStyles";

const BasicInfoPanel = () => {
    const { user, updateUser } = useAuth();
    const showToast = useToast();

    const [fullName, setFullName] = useState(user?.fullName ?? "");
    const [displayName, setDisplayName] = useState(user?.displayName ?? "");
    const [banner, setBanner] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const nameError =
            validateFullName(fullName) ?? validateDisplayName(displayName);
        if (nameError) {
            setBanner(nameError);
            return;
        }

        setBanner(null);
        setSaving(true);

        try {
            const updated = await updateProfile({
                fullName: fullName.trim(),
                // Sending "" would clear it; omit instead when left blank.
                ...(displayName.trim()
                    ? { displayName: displayName.trim() }
                    : {}),
                role: user?.role,
                field: user?.field,
                goal: user?.goal,
            });
            updateUser(updated);
            showToast("Basic info saved");
        } catch (err) {
            if (err instanceof ApiError) {
                setBanner(
                    err.isNetworkError ? `\u{1F50C} ${err.message}` : err.message
                );
            } else {
                setBanner("Something went wrong. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <section>
            <PanelTitle>Basic Info</PanelTitle>
            {banner && <AlertBanner>{banner}</AlertBanner>}
            <PanelForm onSubmit={handleSubmit} noValidate>
                <TextField
                    id="settings-full-name"
                    name="fullName"
                    label="Full Name"
                    radius={settingsInputRadius}
                    maxLength={LIMITS.FULL_NAME}
                    value={fullName}
                    invalid={Boolean(banner)}
                    onChange={(e) => setFullName(e.target.value)}
                />
                <TextField
                    id="settings-display-name"
                    name="displayName"
                    label="Display Name (Optional)"
                    placeholder="How your name appears in the app"
                    radius={settingsInputRadius}
                    maxLength={LIMITS.DISPLAY_NAME}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                />
                <SaveButton type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Basic Info"}
                </SaveButton>
            </PanelForm>
        </section>
    );
};

export default BasicInfoPanel;
