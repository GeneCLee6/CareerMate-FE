import styled from "styled-components";
import { Section, SectionContainer } from "../../../components/Section";
import { landingColors } from "../../../styles/tokens";
import aiEngineeringBgImg from "../../../assets/ai-engineering-bg.png";

const EngineerContainer = styled(SectionContainer)`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
`;

const Background = styled.div`
    width: 100%;
    margin-bottom: -40px;
    display: flex;
    justify-content: center;
`;

const BackgroundImage = styled.img`
    width: 100%;
    height: auto;
    display: block;
`;

const Content = styled.div`
    text-align: center;
    max-width: 900px;
    position: absolute;
    z-index: 2;
    top: 75%;
`;

const Title = styled.h2`
    font-size: 36px;
    font-weight: 700;
    line-height: 1.3;
    color: ${landingColors.heading};
    margin: 0 0 24px 0;
`;

const Subtitle = styled.p`
    font-size: 18px;
    font-weight: 500;
    line-height: 1.6;
    color: ${landingColors.body};
    margin: 0 0 12px 0;
    text-align: center;
`;

const Description = styled.p`
    font-size: 18px;
    font-weight: 400;
    line-height: 1.6;
    color: ${landingColors.muted};
    margin: 0;
    text-align: center;
`;

const AIEngineer = () => {
    return (
        <Section>
            <EngineerContainer>
                <Background>
                    <BackgroundImage
                        src={aiEngineeringBgImg}
                        alt="AI Engineer Background"
                    />
                </Background>
                <Content>
                    <Title>Built with the Power of AI Engineering</Title>
                    <Subtitle>
                        Powered by OpenAI GPT models, LangChain, and AWS Cloud.
                    </Subtitle>
                    <Description>
                        Developed by JR Academy’s AI Engineering program — where
                        learning meets innovation.
                    </Description>
                </Content>
            </EngineerContainer>
        </Section>
    );
};

export default AIEngineer;
