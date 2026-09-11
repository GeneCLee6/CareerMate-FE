import { FormEvent, useCallback, useState } from "react";
import styled from "styled-components";
import ArrowIcon from "../../../components/ArrowIcon";
import {
    ContactFormValues,
    ContactFormErrors,
    ContactFieldName,
    EMPTY_CONTACT_FORM,
    validateContactField,
    validateContactForm,
} from "./validation";
import { sendContactMessage } from "./sendContactMessage";
import { RequestStatus } from "../../../types";

const Container = styled.section`
    background-color: #f9fafc;
    padding: 40px;
    width: 100%;
`;

const ContactContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: start;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 40px;
    }
`;

const ContactInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 30px;
`;

const Title = styled.h2`
    font-size: 48px;
    font-weight: 700;
    line-height: 1.3;
    color: #000;
    margin: 0;
`;

const Description = styled.p`
    margin: 0;
`;

const Details = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-top: 20px;
`;

const Detail = styled.div``;

const DetailLabel = styled.p`
    margin: 0;
`;

const DetailValue = styled.p`
    margin: 0;
`;

const AvailableTime = styled.p`
    margin: 0;
`;

const FormWrapper = styled.div`
    background-color: #fff;
    padding: 40px;
    border-radius: 16px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    color: #000;
`;

const fieldStyles = `
    width: 100%;
    padding: 14px 16px;
    font-size: 15px;
    font-family: inherit;
    color: #000;
    background-color: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    outline: none;
`;

const Input = styled.input`
    ${fieldStyles}

    &::placeholder {
        color: #ccc;
    }
`;

const Select = styled.select`
    ${fieldStyles}
    appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
    background-repeat: no-repeat;
    background-position: right 16px center;
    background-size: 16px;
`;

const Textarea = styled.textarea`
    ${fieldStyles}
    resize: vertical;
    min-height: 120px;

    &::placeholder {
        color: #ccc;
    }
`;

const ErrorMessage = styled.div`
    color: #ff0000;
    font-size: 14px;
    font-weight: 400;
    margin-top: 4px;
`;

const StatusMessage = styled.p<{ $status: RequestStatus }>`
    margin: 0;
    font-size: 14px;
    color: ${({ $status }) => ($status === "error" ? "#ff0000" : "#16a34a")};
`;

const SubmitButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 32px;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    background-color: #000;
    border: none;
    border-radius: 28px;
    cursor: pointer;
    align-self: flex-end;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ROLE_OPTIONS = [
    { value: "student", label: "Student" },
    { value: "professional", label: "Professional" },
    { value: "other", label: "Other" },
];

const FIELD_OPTIONS = [
    { value: "software-engineering", label: "Software Engineering" },
    { value: "data-science", label: "Data Science" },
    { value: "cybersecurity", label: "Cybersecurity" },
    { value: "other", label: "Other" },
];

const ContactSection = () => {
    const [values, setValues] = useState<ContactFormValues>(EMPTY_CONTACT_FORM);
    const [errors, setErrors] = useState<ContactFormErrors>({});
    const [status, setStatus] = useState<RequestStatus>("idle");
    const [statusMessage, setStatusMessage] = useState("");

    const handleChange = useCallback(
        (name: ContactFieldName, value: string) => {
            setValues((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleBlur = useCallback((name: ContactFieldName, value: string) => {
        setErrors((prev) => ({ ...prev, [name]: validateContactField(name, value) }));
    }, []);

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const nextErrors = validateContactForm(values);
            setErrors(nextErrors);

            if (Object.keys(nextErrors).length > 0) {
                setStatus("error");
                setStatusMessage("Please fix the highlighted fields.");
                return;
            }

            try {
                setStatus("loading");
                setStatusMessage("");
                await sendContactMessage(values);
                setStatus("success");
                setStatusMessage("Thanks! Your message has been sent.");
                setValues(EMPTY_CONTACT_FORM);
            } catch (err) {
                setStatus("error");
                setStatusMessage(
                    err instanceof Error
                        ? err.message
                        : "Something went wrong. Please try again."
                );
            }
        },
        [values]
    );

    return (
        <Container id="contact">
            <ContactContainer>
                <ContactInfo>
                    <Title>
                        Get in
                        <br />
                        touch with us
                    </Title>
                    <Description>
                        We're here to help! Whether you have a question about
                        our services, need assistance with your account, or want
                        to provide feedback, our team is ready to assist you.
                    </Description>

                    <Details>
                        <Detail>
                            <DetailLabel>Email:</DetailLabel>
                            <DetailValue>Hello@careermate.com</DetailValue>
                        </Detail>
                        <Detail>
                            <DetailLabel>Phone:</DetailLabel>
                            <DetailValue>+61 123456789</DetailValue>
                        </Detail>
                        <AvailableTime>
                            Available Monday to Friday, 9 AM - 6 PM GMT
                        </AvailableTime>
                    </Details>
                </ContactInfo>

                <FormWrapper>
                    <Form id="contactForm" noValidate onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="Your full name"
                                value={values.fullName}
                                onChange={(e) =>
                                    handleChange("fullName", e.target.value)
                                }
                                onBlur={(e) =>
                                    handleBlur("fullName", e.target.value)
                                }
                            />
                            {errors.fullName && (
                                <ErrorMessage>
                                    <span>{errors.fullName}</span>
                                </ErrorMessage>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="text"
                                id="email"
                                name="email"
                                placeholder="Your email"
                                value={values.email}
                                onChange={(e) =>
                                    handleChange("email", e.target.value)
                                }
                                onBlur={(e) =>
                                    handleBlur("email", e.target.value)
                                }
                            />
                            {errors.email && (
                                <ErrorMessage>
                                    <span>{errors.email}</span>
                                </ErrorMessage>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="role">Role</Label>
                            <Select
                                id="role"
                                name="role"
                                value={values.role}
                                onChange={(e) =>
                                    handleChange("role", e.target.value)
                                }
                                onBlur={(e) =>
                                    handleBlur("role", e.target.value)
                                }
                            >
                                <option value="">Selected</option>
                                {ROLE_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                            {errors.role && (
                                <ErrorMessage>
                                    <span>{errors.role}</span>
                                </ErrorMessage>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="field">Your Field</Label>
                            <Select
                                id="field"
                                name="field"
                                value={values.field}
                                onChange={(e) =>
                                    handleChange("field", e.target.value)
                                }
                                onBlur={(e) =>
                                    handleBlur("field", e.target.value)
                                }
                            >
                                <option value="">Selected</option>
                                {FIELD_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                            {errors.field && (
                                <ErrorMessage>
                                    <span>{errors.field}</span>
                                </ErrorMessage>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder="Enter your message..."
                                value={values.message}
                                onChange={(e) =>
                                    handleChange("message", e.target.value)
                                }
                                onBlur={(e) =>
                                    handleBlur("message", e.target.value)
                                }
                            />
                            {errors.message && (
                                <ErrorMessage>
                                    <span>{errors.message}</span>
                                </ErrorMessage>
                            )}
                        </FormGroup>

                        {status !== "idle" && status !== "loading" && statusMessage && (
                            <StatusMessage $status={status}>
                                {statusMessage}
                            </StatusMessage>
                        )}

                        <SubmitButton
                            type="submit"
                            disabled={status === "loading"}
                        >
                            {status === "loading" ? "Sending..." : "Send Message"}
                            <ArrowIcon />
                        </SubmitButton>
                    </Form>
                </FormWrapper>
            </ContactContainer>
        </Container>
    );
};

export default ContactSection;
