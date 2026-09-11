import { ReactNode } from "react";
import styled from "styled-components";
import { colors } from "../../styles/tokens";

const Banner = styled.p`
    margin: 0;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    color: ${colors.danger};
    background-color: ${colors.dangerSurface};
    border-radius: 8px;
`;

export interface AlertBannerProps {
    children: ReactNode;
}

/** The pink validation / failure banner that sits above the auth forms. */
const AlertBanner = ({ children }: AlertBannerProps) => (
    <Banner role="alert">{children}</Banner>
);

export default AlertBanner;
