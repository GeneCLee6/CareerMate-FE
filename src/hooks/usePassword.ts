import { ChangeEvent, useState } from "react";

const usePassword = () => {
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    function passwordChange(e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setPassword(value);
        if (!value.trim()) {
            setPasswordError("Password is required");
        } else if (value.length < 6) {
            setPasswordError("Password must be at least 6 characters");
        } else if (value.length > 20) {
            setPasswordError("Password must be less than 20 characters");
        } else {
            setPasswordError("");
        }
    }
    return { password, passwordError, passwordChange };
};

export default usePassword;
