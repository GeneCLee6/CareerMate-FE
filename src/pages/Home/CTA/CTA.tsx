import styled from "styled-components";
import { landingColors, landingGradients } from "../../../styles/tokens";

const Container = styled.section`
    width: 100%;
    background-color: ${landingColors.surface};
    padding: 100px 40px 0;
    margin-bottom: -80px;
    position: relative;
    z-index: 2;
`;

const CTAContainer = styled.div`
    background: ${landingGradients.primary};
    border-radius: 32px;
    padding: 80px 60px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
`;

const Card = styled.div`
    display: flex;
    flex-direction: column;
    gap: 34px;
`;

const Title = styled.h2`
    font-size: 48px;
    font-weight: 700;
    line-height: 1.3;
    color: ${landingColors.onGradient};
    margin: 0;
`;

const Subtitle = styled.p`
    font-size: 18px;
    font-weight: 400;
    line-height: 1.4;
    color: ${landingColors.onGradientMuted};
    margin: 0;
`;

const Button = styled.a`
    display: inline-block;
    padding: 16px 36px;
    font-size: 16px;
    font-weight: 500;
    color: ${landingColors.onGradient};
    background-color: ${landingColors.heading};
    border: none;
    border-radius: 28px;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 72px;

    &:hover {
        background-color: ${landingColors.headingHover};
        transform: translateY(-2px);
    }
`;

const CTA = () => {
    return (
        <Container>
            <CTAContainer>
                <Card>
                    <Title>Ready to level up your career?</Title>
                    <Subtitle>
                        Start your AI-powered journey today.
                        <br />
                        It’s free, smart, and made for you.
                    </Subtitle>
                </Card>
                <Button href="#start">Start Practingcing for Free</Button>
            </CTAContainer>
        </Container>
    );
};

export default CTA;
