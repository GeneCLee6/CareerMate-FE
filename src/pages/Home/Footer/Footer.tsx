import { Link as RouterLink } from "react-router-dom";
import styled, { css } from "styled-components";
import { landingColors, landingLayout } from "../../../styles/tokens";
import logoIcon from "../../../assets/logo-icon.png";
import logoText from "../../../assets/logo-text.png";

interface FooterLinkItem {
    href: string;
    label: string;
    external?: boolean;
}

const FOOTER_LINKS: FooterLinkItem[] = [
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
    { href: "#contact", label: "Contact" },
    {
        href: "https://jracademy.com.au",
        label: "JR Academy",
        external: true,
    },
];

const Container = styled.footer`
    width: 100%;
    background-color: ${landingColors.surfaceFooter};
    padding: 120px 40px 40px;
    position: relative;
    z-index: 1;
`;

const FooterContainer = styled.div`
    max-width: ${landingLayout.contentMaxWidth};
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: ${landingLayout.mobile}) {
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
    color: ${landingColors.muted};
    margin: 0;
`;

const Links = styled.div`
    display: flex;
    align-items: center;
    gap: 32px;
`;

/** Shared so the routed and plain links cannot drift apart visually. */
const footerLinkStyles = css`
    font-size: 15px;
    font-weight: 400;
    color: ${landingColors.body};
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
        color: ${landingColors.heading};
    }
`;

const Link = styled.a`
    ${footerLinkStyles}
`;

/** Same styling as Link, but routed — an in-app page should not reload. */
const RoutedLink = styled(RouterLink)`
    ${footerLinkStyles}
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
                    {FOOTER_LINKS.map((link) =>
                        link.href.startsWith("/") ? (
                            <RoutedLink key={link.label} to={link.href}>
                                {link.label}
                            </RoutedLink>
                        ) : (
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
                        )
                    )}
                </Links>
            </FooterContainer>
        </Container>
    );
};

export default Footer;
