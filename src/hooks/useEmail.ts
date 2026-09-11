import { ChangeEvent, useState } from "react";

const useEmail = () => {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    function emailChange(e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setEmail(value);
        if (!value.trim()) {
            setEmailError("Email is required");
        } else if (!value.includes("@")) {
            setEmailError("Invalid email format");
        } else {
            setEmailError("");
        }
    }
    return { email, emailError, emailChange };
};

export default useEmail;
