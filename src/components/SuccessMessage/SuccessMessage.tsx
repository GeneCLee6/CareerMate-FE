import { ReactNode } from "react";
import styled from "styled-components";
import { colors } from "../../styles/tokens";
import { Check } from "lucide-react";
import Icon from "../Icon";

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
                <Icon icon={Check} size="xxl" />
            </CheckInner>
        </CheckCircle>
        <Message>{message}</Message>
        {children}
    </Wrapper>
);

export default SuccessMessage;
