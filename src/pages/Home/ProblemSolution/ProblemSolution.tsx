import styled from "styled-components";
import { Section, SectionContainer } from "../../../components/Section";
import {
    landingColors,
    landingGradients,
    landingLayout,
} from "../../../styles/tokens";
import rocketIconImg from "../../../assets/rocket-icon.png";

const PROBLEMS: string[] = [
    "Your resume keeps getting ignored.",
    "You don’t know what interviewers expect.",
    "You’re unsure how to plan your career.",
];

const ProblemSolutionContainer = styled(SectionContainer)`
    max-width: ${landingLayout.contentMaxWidthNarrow};
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;

    @media (max-width: ${landingLayout.mobile}) {
        grid-template-columns: 1fr;
        gap: 40px;
    }
`;

const Title = styled.h2`
    font-size: 36px;
    font-weight: 700;
    line-height: 1.3;
    color: ${landingColors.heading};
    text-align: center;
    margin: 0 0 48px 0;
`;

const ProblemSide = styled.div`
    display: flex;
    flex-direction: column;
    gap: 40px;
`;

const ProblemList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 48px;
    list-style: none;
    margin: 0;
    padding: 0;
`;

const ProblemItem = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: ${landingColors.surfaceSubtle};
    padding: 24px 28px;
    border-radius: 12px;
    transition: all 0.3s ease;
`;

const ProblemText = styled.p`
    margin: 0;
`;

const ProblemIcon = styled.div`
    width: 40px;
    height: 40px;
    background-color: ${landingColors.heading};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: 20px;
`;

const SolutionSide = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const SolutionCard = styled.div`
    background: ${landingGradients.card};
    border-radius: 24px;
    padding: 60px 50px;
    position: relative;
    min-height: 450px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(80, 79, 253, 0.3);
    overflow: hidden;
`;

const SolutionContent = styled.div`
    position: relative;
    z-index: 2;
    max-width: 80%;
`;

const SolutionText = styled.h3`
    font-size: 36px;
    font-weight: 700;
    line-height: 1.3;
    color: ${landingColors.onGradient};
    margin: 0;
`;

const RocketIcon = styled.img`
    width: 180px;
    height: auto;
    position: absolute;
    right: 0;
    bottom: -45%;
    transform: translateY(-50%);
    z-index: 1;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));
`;

const ProblemSolution = () => {
    return (
        <Section>
            <Title>Still Struggling with Job Applications?</Title>
            <ProblemSolutionContainer>
                <ProblemSide>
                    <ProblemList>
                        {PROBLEMS.map((problem) => (
                            <ProblemItem key={problem}>
                                <ProblemText>{problem}</ProblemText>
                                <ProblemIcon>
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M7 17L17 7M17 7H7M17 7V17"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </ProblemIcon>
                            </ProblemItem>
                        ))}
                    </ProblemList>
                </ProblemSide>

                <SolutionSide>
                    <SolutionCard>
                        <SolutionContent>
                            <SolutionText>
                                CareerMate AI helps you fix all of that —
                                smartly.
                            </SolutionText>
                        </SolutionContent>
                        <RocketIcon src={rocketIconImg} alt="Rocket" />
                    </SolutionCard>
                </SolutionSide>
            </ProblemSolutionContainer>
        </Section>
    );
};

export default ProblemSolution;
