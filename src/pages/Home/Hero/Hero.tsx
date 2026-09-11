import { Link as RouterLink } from "react-router-dom";
import styled, { css } from "styled-components";
import ArrowIcon from "../../../components/ArrowIcon";
import {
    landingColors,
    landingGradients,
    landingLayout,
} from "../../../styles/tokens";
import heroDecorationImg from "../../../assets/arrow-decoration.png";

const Container = styled.section`
    width: 100%;
    background: ${landingGradients.hero};
    padding: 120px 40px 100px;
    position: relative;
    overflow: hidden;
`;

const HeroContainer = styled.div`
    max-width: ${landingLayout.contentMaxWidth};
    margin: 0 auto;
    position: relative;
`;

const HeroContent = styled.div`
    text-align: center;
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
`;

const Title = styled.h1`
    font-size: 48px;
    font-weight: 700;
    line-height: 1.2;
    color: ${landingColors.heading};
    margin: 0 0 24px 0;
    letter-spacing: -0.02em;
    border: 2px dashed ${landingColors.borderDashed};
    padding: 40px 60px;
    border-radius: 16px;
    position: relative;
    display: inline-block;
    z-index: 1;
`;

const Description = styled.p`
    font-size: 18px;
    font-weight: 400;
    line-height: 1.6;
    color: ${landingColors.muted};
    margin: 0 0 48px 0;
`;

const Buttons = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
`;

const buttonStyles = css`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    padding: 14px 32px;
    border-radius: 28px;
    transition: background-color 0.3s ease;
    white-space: nowrap;
    cursor: pointer;
`;

/** Routes into the app, so it is a router link rather than a hash anchor. */
const PrimaryButton = styled(RouterLink)`
    ${buttonStyles}
    background: ${landingGradients.primary};
    color: ${landingColors.onGradient};
    box-shadow: 0 4px 12px rgba(80, 79, 253, 0.3);

    &:hover {
        box-shadow: 0 6px 20px rgba(80, 79, 253, 0.4);
        transform: translateY(-2px);
    }
`;

const SecondaryButton = styled.a`
    ${buttonStyles}
    background-color: ${landingColors.surface};
    color: ${landingColors.body};
    border: 2px solid ${landingColors.border};

    &:hover {
        color: ${landingColors.body};
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
`;

const HeroDecoration = styled.img`
    position: absolute;
    top: 15%;
    right: 52%;
    transform: translate(460px, 65px);
    width: 70px;
    height: auto;
    z-index: 10;
    opacity: 0.9;
    pointer-events: none;
`;

const Hero = () => {
    return (
        <Container>
            <HeroContainer>
                <HeroContent>
                    <Title>Your AI Career Practice Partner</Title>
                    <Description>
                        Get job-ready with AI — from resumes to interviews,
                        <br />
                        CareerMate AI coaches you step by step.
                    </Description>
                    <Buttons>
                        <PrimaryButton to="/register">
                            Start for Free
                            <ArrowIcon />
                        </PrimaryButton>
                        <SecondaryButton href="#demo">
                            Watch Demo
                            <ArrowIcon />
                        </SecondaryButton>
                    </Buttons>
                </HeroContent>
                <HeroDecoration
                    src={heroDecorationImg}
                    alt="hero-decoration"
                    aria-hidden="true"
                />
            </HeroContainer>
        </Container>
    );
};

export default Hero;
