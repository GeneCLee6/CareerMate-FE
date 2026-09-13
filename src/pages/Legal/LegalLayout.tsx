import { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { landingColors, landingLayout } from "../../styles/tokens";
import logoIcon from "../../assets/logo-icon.png";
import logoText from "../../assets/logo-text.png";

const Page = styled.div`
    min-height: 100vh;
    background-color: #fff;
    color: ${landingColors.body};
`;

const Header = styled.header`
    display: flex;
    align-items: center;
    height: 72px;
    padding: 0 32px;
    border-bottom: 1px solid ${landingColors.border};
`;

const Brand = styled(Link)`
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
`;

const LogoIcon = styled.img`
    height: 24px;
    width: auto;
`;

const LogoText = styled.img`
    height: 18px;
    width: auto;
`;

const Content = styled.main`
    max-width: 760px;
    margin: 0 auto;
    padding: 56px 24px 96px;

    @media (max-width: ${landingLayout.mobile}) {
        padding: 36px 20px 64px;
    }
`;

const Title = styled.h1`
    margin: 0 0 8px;
    font-size: 36px;
    font-weight: 900;
    color: ${landingColors.heading};
`;

const Updated = styled.p`
    margin: 0 0 40px;
    font-size: 14px;
    color: ${landingColors.muted};
`;

/**
 * Body styles live on the wrapper rather than on a styled component per tag,
 * so the pages themselves stay readable as prose.
 */
const Body = styled.div`
    font-size: 15px;
    line-height: 1.75;

    h2 {
        margin: 40px 0 12px;
        font-size: 20px;
        font-weight: 700;
        color: ${landingColors.heading};
    }

    p {
        margin: 0 0 16px;
    }

    ul {
        margin: 0 0 16px;
        padding-left: 22px;
    }

    li {
        margin-bottom: 8px;
    }

    strong {
        color: ${landingColors.heading};
    }

    a {
        color: #2f6bff;
    }

    table {
        width: 100%;
        margin: 0 0 20px;
        border-collapse: collapse;
        font-size: 14px;
    }

    th,
    td {
        padding: 10px 12px;
        text-align: left;
        border: 1px solid ${landingColors.border};
        vertical-align: top;
    }

    th {
        background-color: ${landingColors.surfaceSubtle};
        font-weight: 600;
        color: ${landingColors.heading};
    }
`;

const BackLink = styled(Link)`
    display: inline-block;
    margin-top: 48px;
    font-size: 14px;
    color: #2f6bff;
`;

export interface LegalLayoutProps {
    title: string;
    updated: string;
    children: ReactNode;
}

/** Shared shell for the terms and privacy pages. */
const LegalLayout = ({ title, updated, children }: LegalLayoutProps) => (
    <Page>
        <Header>
            <Brand to="/" aria-label="CareerMate AI home">
                <LogoIcon src={logoIcon} alt="" />
                <LogoText src={logoText} alt="CareerMate AI" />
            </Brand>
        </Header>
        <Content>
            <Title>{title}</Title>
            <Updated>Last updated: {updated}</Updated>
            <Body>{children}</Body>
            <BackLink to="/">← Back to CareerMate AI</BackLink>
        </Content>
    </Page>
);

export default LegalLayout;
