import styled from "styled-components";
import mockInterviewImg from "../../../assets/card-mock-interview.png";
import resumeAnalyzerImg from "../../../assets/card-resume-analyzer.png";
import careerCoachImg from "../../../assets/card-career-coach.png";
import projectReviewerImg from "../../../assets/card-project-reviewer.png";

interface FeatureCardItem {
    img: string;
    title: string;
    description: string;
}

const FEATURE_CARDS: FeatureCardItem[] = [
    {
        img: mockInterviewImg,
        title: "AI Mock Interview",
        description:
            "Practice real interview questions and get instant feedback.",
    },
    {
        img: resumeAnalyzerImg,
        title: "Resume Analyzer",
        description: "Upload your resume, and get improvement tips instantly.",
    },
    {
        img: careerCoachImg,
        title: "Career Coach Mode",
        description: "Discover your ideal job path and skill roadmap.",
    },
    {
        img: projectReviewerImg,
        title: "Project Reviewer",
        description:
            "Let AI turn your past projects into strong interview stories.",
    },
];

const Container = styled.section`
    width: 100%;
    background-color: #fff;
    padding: 100px 40px;
`;

const ShowcaseContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const Title = styled.h2`
    font-size: 36px;
    font-weight: 700;
    color: #000;
    text-align: center;
    margin: 0 0 60px 0;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background-color: #f5f5f7;
    border-radius: 20px;
    overflow: hidden;
    padding: 32px 32px 28px;
    display: flex;
    flex-direction: column;
`;

const CardImage = styled.img`
    width: 100%;
    height: auto;
    border-radius: 12px;
    display: block;
    margin-bottom: 24px;
`;

const CardTitle = styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: #000;
    margin: 0 0 8px 0;
`;

const CardDescription = styled.p`
    font-size: 14px;
    color: #666;
    margin: 0;
    line-height: 1.6;
`;

const FeaturesShowcase = () => {
    return (
        <Container id="features">
            <ShowcaseContainer>
                <Title>Everything You Need to Grow Your Career</Title>
                <Grid>
                    {FEATURE_CARDS.map((card) => (
                        <Card key={card.title}>
                            <CardImage src={card.img} alt={card.title} />
                            <CardTitle>{card.title}</CardTitle>
                            <CardDescription>
                                {card.description}
                            </CardDescription>
                        </Card>
                    ))}
                </Grid>
            </ShowcaseContainer>
        </Container>
    );
};

export default FeaturesShowcase;
