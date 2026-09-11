import { FormEvent, useState } from "react";
import TextField from "../../components/TextField";
import PasswordField from "../../components/PasswordField";
import AlertBanner from "../../components/AlertBanner";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import { updatePassword } from "../../api/users";
import { validatePassword } from "../../utils/validators";
import {
    Divider,
    Hint,
    PanelForm,
    PanelTitle,
    SaveButton,
    Subhead,
    SubheadRow,
    settingsInputRadius,
} from "./settingsStyles";

const SecurityPanel = () => {
    const { user } = useAuth();
    const showToast = useToast();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [banner, setBanner] = useState<string | null>(null);
    const [invalidFields, setInvalidFields] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!currentPassword) {
            setBanner("Please enter your current password.");
            setInvalidFields(["currentPassword"]);
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setBanner(passwordError);
            setInvalidFields(["newPassword"]);
            return;
        }

        if (newPassword !== confirmPassword) {
            setBanner("Passwords do not match.");
            setInvalidFields(["confirmPassword"]);
            return;
        }

        setBanner(null);
        setInvalidFields([]);
        setSaving(true);

        try {
            await updatePassword({ currentPassword, newPassword });
            showToast("Password updated");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                // The server returns 401 when the current password is wrong.
                setBanner("Your current password is incorrect.");
                setInvalidFields(["currentPassword"]);
            } else if (err instanceof ApiError) {
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
            <PanelTitle>Account &amp; Security</PanelTitle>
            <PanelForm onSubmit={handleSubmit} noValidate>
                <TextField
                    id="settings-email"
                    label="Login Email"
                    radius={settingsInputRadius}
                    value={user?.email ?? ""}
                    readOnly
                    disabled
                />
                <Hint>
                    Your login email cannot be changed here. Contact support if
                    needed.
                </Hint>

                <SubheadRow>
                    <Subhead>Change Password</Subhead>
                    <Divider />
                </SubheadRow>

                {banner && <AlertBanner>{banner}</AlertBanner>}

                <PasswordField
                    id="current-password"
                    name="currentPassword"
                    label="Current Password"
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    radius={settingsInputRadius}
                    value={currentPassword}
                    invalid={invalidFields.includes("currentPassword")}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <PasswordField
                    id="new-password"
                    name="newPassword"
                    label="New Password"
                    placeholder="At least 8 characters, letters and numbers"
                    autoComplete="new-password"
                    radius={settingsInputRadius}
                    value={newPassword}
                    invalid={invalidFields.includes("newPassword")}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <PasswordField
                    id="confirm-new-password"
                    name="confirmPassword"
                    label="Confirm New Password"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    radius={settingsInputRadius}
                    value={confirmPassword}
                    invalid={invalidFields.includes("confirmPassword")}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <SaveButton type="submit" disabled={saving}>
                    {saving ? "Updating..." : "Update Password"}
                </SaveButton>
            </PanelForm>
        </section>
    );
};

export default SecurityPanel;
