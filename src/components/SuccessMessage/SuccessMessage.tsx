import { ReactNode } from "react";
import styled from "styled-components";
import { colors } from "../../styles/tokens";

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    text-align: center;
`;

const CheckCircle = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    background-color: #eef1ff;
    border-radius: 50%;
`;

const CheckInner = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    color: #fff;
    background-color: #2f6bff;
    border-radius: 50%;
`;

const Message = styled.p`
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: ${colors.text};
`;

export interface SuccessMessageProps {
    message: string;
    /** Optional call to action rendered under the message. */
    children?: ReactNode;
}

/** The blue tick confirmation shown after registering or resetting a password. */
const SuccessMessage = ({ message, children }: SuccessMessageProps) => (
    <Wrapper>
        <CheckCircle>
            <CheckInner>
                <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M20 6 9 17l-5-5" />
                </svg>
            </CheckInner>
        </CheckCircle>
        <Message>{message}</Message>
        {children}
    </Wrapper>
);

export default SuccessMessage;
