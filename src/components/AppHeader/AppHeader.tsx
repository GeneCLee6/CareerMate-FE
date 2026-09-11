import { Link } from "react-router-dom";
import styled from "styled-components";
import UserMenu from "../UserMenu";
import logoIcon from "../../assets/logo-icon.png";
import logoText from "../../assets/logo-text.png";
import { fontFamily } from "../../styles/tokens";

const Bar = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 32px;
    font-family: ${fontFamily};
    background-color: #fff;
    border-bottom: 1px solid #eef0f3;
`;

const Logo = styled(Link)`
    display: inline-flex;
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

/** Slim bar across the signed-in screens: logo on the left, account on the right. */
const AppHeader = () => (
    <Bar>
        <Logo to="/app" aria-label="CareerMate AI home">
            <LogoIcon src={logoIcon} alt="" />
            <LogoText src={logoText} alt="CareerMate AI" />
        </Logo>
        <UserMenu />
    </Bar>
);

export default AppHeader;
