import { FormEvent, useState } from "react";
import SelectField from "../../components/SelectField";
import TextField from "../../components/TextField";
import AlertBanner from "../../components/AlertBanner";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import { updateProfile } from "../../api/users";
import { FIELD_OPTIONS, ROLE_OPTIONS } from "../Onboarding/options";
import {
    PanelForm,
    PanelTitle,
    SaveButton,
    settingsInputRadius,
} from "./settingsStyles";

const CareerPanel = () => {
    const { user, updateUser } = useAuth();
    const showToast = useToast();

    const [role, setRole] = useState(user?.role ?? "");
    const [field, setField] = useState(user?.field ?? "");
    const [goal, setGoal] = useState(user?.goal ?? "");
    const [banner, setBanner] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setBanner(null);
        setSaving(true);

        try {
            const updated = await updateProfile({
                fullName: user?.fullName ?? "",
                displayName: user?.displayName,
                ...(role ? { role: role as "Student" | "Other" } : {}),
                ...(field ? { field: field as "FE" | "BE" } : {}),
                ...(goal.trim() ? { goal: goal.trim() } : {}),
            });
            updateUser(updated);
            showToast("Career settings saved");
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
            <PanelTitle>Career &amp; Learning</PanelTitle>
            {banner && <AlertBanner>{banner}</AlertBanner>}
            <PanelForm onSubmit={handleSubmit} noValidate>
                <SelectField
                    id="settings-role"
                    label="Your Role"
                    options={ROLE_OPTIONS}
                    radius={settingsInputRadius}
                    value={role}
                    onChange={(e) => setRole(e.target.value as typeof role)}
                />
                <SelectField
                    id="settings-field"
                    label="Your Field"
                    options={FIELD_OPTIONS}
                    radius={settingsInputRadius}
                    value={field}
                    onChange={(e) => setField(e.target.value as typeof field)}
                />
                <TextField
                    id="settings-goal"
                    name="goal"
                    label="Your Goal"
                    placeholder="What are you working towards?"
                    radius={settingsInputRadius}
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                />
                <SaveButton type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Career Settings"}
                </SaveButton>
            </PanelForm>
        </section>
    );
};

export default CareerPanel;
