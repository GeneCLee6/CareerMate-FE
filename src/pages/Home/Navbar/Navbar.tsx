import styled from "styled-components";
import logoIcon from "../../../assets/logo-icon.png";
import logoText from "../../../assets/logo-text.png";

const Container = styled.nav`
    width: 100%;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e5e5;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    padding: 0;
`;

const NavContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    margin: 0 auto;
    max-width: 1400px;

    @media (max-width: 768px) {
        padding: 16px 20px;
    }
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
`;

const LogoIcon = styled.img`
    height: 28px;
    width: auto;
`;

const Links = styled.div`
    display: flex;
    align-items: center;
    gap: 40px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    @media (max-width: 768px) {
        gap: 20px;
    }
`;

const Link = styled.a`
    text-decoration: none;
    color: #333;
    font-size: 15px;
    transition: color 0.3s ease;
    white-space: nowrap;

    &:hover {
        color: #000;
    }

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const Buttons = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const SignInButton = styled(Link)`
    font-weight: 500;
    padding: 8px 16px;
`;

const StartButton = styled.a`
    text-decoration: none;
    background-color: #000;
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    padding: 10px 24px;
    border-radius: 24px;
    transition:
        background-color 0.3s ease,
        transform 0.2s ease;
    white-space: nowrap;
    display: inline-block;

    &:hover {
        background-color: #333;
        transform: translateY(-1px);
    }
`;

const Navbar = () => {
    return (
        <Container>
            <NavContainer>
                <Logo>
                    <LogoIcon src={logoIcon} alt="CareerMate AI Logo" />
                    <img src={logoText} alt="CareerMate AI text" />
                </Logo>
                <Links>
                    <Link href="#features">Features</Link>
                    <Link href="#demo">Demo</Link>
                </Links>
                <Buttons>
                    <SignInButton href="#signin">Sign In</SignInButton>
                    <StartButton href="#start">Start for Free</StartButton>
                </Buttons>
            </NavContainer>
        </Container>
    );
};

export default Navbar;
