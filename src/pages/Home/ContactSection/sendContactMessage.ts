import emailjs from "@emailjs/browser";
import { ContactFormValues } from "./validation";

const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;

/**
 * Sends the contact form through EmailJS.
 *
 * The EmailJS credentials come from the environment (see .env.example). While
 * they are not configured the submission is logged instead of sent, so the form
 * stays usable in local development.
 */
export async function sendContactMessage(
    values: ContactFormValues
): Promise<void> {
    const templateParams = {
        title: "New Contact Form Submission",
        ...values,
    };

    if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID) {
        console.log("EmailJS is not configured, form data:", templateParams);
        return;
    }

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, {
        publicKey: PUBLIC_KEY,
    });
}
