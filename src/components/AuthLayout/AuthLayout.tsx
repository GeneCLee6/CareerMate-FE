import { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import logoIcon from "../../assets/logo-icon.png";
import logoText from "../../assets/logo-text.png";
import authPanel from "../../assets/auth-panel.png";
import { colors, fontFamily } from "../../styles/tokens";

const Page = styled.div`
    font-family: ${fontFamily};
    color: ${colors.text};
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 712px;
    background-color: #fff;

    @media (max-width: 1100px) {
        grid-template-columns: 1fr;
    }
`;

const Left = styled.div`
    display: flex;
    flex-direction: column;
    padding: 32px 32px 48px;
`;

const Header = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
`;

const Logo = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
`;

const LogoIcon = styled.img`
    height: 26px;
    width: auto;
`;

const LogoText = styled.img`
    height: 20px;
    width: auto;
`;

/** Centres the form column on the 440px control width from the design. */
const Content = styled.main`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
`;

const Column = styled.div`
    width: 100%;
    max-width: 440px;
`;

const Panel = styled.aside`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 24px 24px 24px 0;

    @media (max-width: 1100px) {
        display: none;
    }
`;

/**
 * The exported artwork already carries its rounded corners and the testimonial
 * card that overhangs to the left, so it is scaled whole rather than cropped.
 */
const PanelImage = styled.img`
    display: block;
    height: 100%;
    max-height: calc(100vh - 48px);
    width: auto;
    max-width: 100%;
`;

export interface AuthLayoutProps {
    children: ReactNode;
    /** Optional control rendered opposite the logo, e.g. the "Back" button. */
    headerAction?: ReactNode;
    /** The illustration is decorative; hide it for the single-column screens. */
    showPanel?: boolean;
}

const AuthLayout = ({
    children,
    headerAction,
    showPanel = true,
}: AuthLayoutProps) => {
    return (
        <Page style={showPanel ? undefined : { gridTemplateColumns: "1fr" }}>
            <Left>
                <Header>
                    <Logo to="/" aria-label="CareerMate AI home">
                        <LogoIcon src={logoIcon} alt="" />
                        <LogoText src={logoText} alt="CareerMate AI" />
                    </Logo>
                    {headerAction}
                </Header>
                <Content>
                    <Column>{children}</Column>
                </Content>
            </Left>
            {showPanel && (
                <Panel>
                    <PanelImage src={authPanel} alt="" aria-hidden="true" />
                </Panel>
            )}
        </Page>
    );
};

export default AuthLayout;
