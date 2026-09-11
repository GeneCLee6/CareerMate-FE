import styled from "styled-components";
import logoIcon from "../../../assets/logo-icon.png";
import logoText from "../../../assets/logo-text.png";

interface FooterLinkItem {
    href: string;
    label: string;
    external?: boolean;
}

const FOOTER_LINKS: FooterLinkItem[] = [
    { href: "#terms", label: "Terms" },
    { href: "#privacy", label: "Privacy" },
    { href: "#contact", label: "Contact" },
    {
        href: "https://jracademy.com.au",
        label: "JR Academy",
        external: true,
    },
];

const Container = styled.footer`
    width: 100%;
    background-color: #fafafa;
    padding: 120px 40px 40px;
    position: relative;
    z-index: 1;
`;

const FooterContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 24px;
    }
`;

const Left = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const LogoIcon = styled.img`
    height: 24px;
    width: auto;
`;

const LogoText = styled.img`
    height: 20px;
    width: auto;
`;

const Copyright = styled.p`
    font-size: 14px;
    font-weight: 400;
    color: #666;
    margin: 0;
`;

const Links = styled.div`
    display: flex;
    align-items: center;
    gap: 32px;
`;

const Link = styled.a`
    font-size: 15px;
    font-weight: 400;
    color: #333;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
        color: #000;
    }
`;

const Footer = () => {
    return (
        <Container>
            <FooterContainer>
                <Left>
                    <Logo>
                        <LogoIcon src={logoIcon} alt="CareerMate AI Logo" />
                        <LogoText src={logoText} alt="CareerMate AI" />
                    </Logo>
                    <Copyright>© 2026 CareerMate AI by JR Academy</Copyright>
                </Left>
                <Links>
                    {FOOTER_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            {...(link.external
                                ? {
                                      target: "_blank",
                                      rel: "noopener noreferrer",
                                  }
                                : {})}
                        >
                            {link.label}
                        </Link>
                    ))}
                </Links>
            </FooterContainer>
        </Container>
    );
};

export default Footer;
