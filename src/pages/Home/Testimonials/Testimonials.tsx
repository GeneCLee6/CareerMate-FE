import styled from "styled-components";
import { Section, SectionContainer } from "../../../components/Section";
import { landingColors, landingLayout } from "../../../styles/tokens";
import emilyImg from "../../../assets/testimonial-emily.png";
import jasonImg from "../../../assets/testimonial-jason.png";

interface TestimonialItem {
    img: string;
    quote: string;
    name: string;
    role: string;
}

const TESTIMONIALS: TestimonialItem[] = [
    {
        img: emilyImg,
        quote: "“CareerMate AI helped me improve my resume and confidence — I landed my first software internship!”",
        name: "Emily",
        role: "University of Sydney",
    },
    {
        img: jasonImg,
        quote: "“The AI mock interviews were just like the real thing.”",
        name: "Jason",
        role: "UNSW Graduate",
    },
];

const TestimonialsContainer = styled(SectionContainer)``;

const Title = styled.h2`
    font-size: 48px;
    font-weight: 700;
    line-height: 1.3;
    color: ${landingColors.heading};
    text-align: center;
    margin: 0 0 60px 0;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;

    @media (max-width: ${landingLayout.mobile}) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background-color: ${landingColors.surface};
    border: 1px solid ${landingColors.border};
    border-radius: 20px;
    padding: 0;
    display: flex;
    overflow: hidden;
    transition: all 0.3s ease;
`;

const CardImage = styled.img`
    width: 40%;
    flex-shrink: 0;
    object-fit: cover;
`;

const Content = styled.div`
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const Quote = styled.p`
    font-size: 18px;
    font-weight: 500;
    line-height: 1.6;
    color: ${landingColors.heading};
    margin: 0 0 30px 0;
`;

const Author = styled.div`
    display: flex;
    flex-direction: column;
`;

const AuthorName = styled.p`
    font-size: 16px;
    font-weight: 700;
    color: ${landingColors.heading};
    margin: 0;
`;

const AuthorRole = styled.p`
    font-size: 14px;
    font-weight: 400;
    color: ${landingColors.muted};
    margin: 0;
`;

const Testimonials = () => {
    return (
        <Section>
            <TestimonialsContainer>
                <Title>Trusted by Students Worldwide</Title>
                <Grid>
                    {TESTIMONIALS.map((testimonial) => (
                        <Card key={testimonial.name}>
                            <CardImage
                                src={testimonial.img}
                                alt={testimonial.name}
                            />
                            <Content>
                                <Quote>{testimonial.quote}</Quote>
                                <Author>
                                    <AuthorName>{testimonial.name}</AuthorName>
                                    <AuthorRole>{testimonial.role}</AuthorRole>
                                </Author>
                            </Content>
                        </Card>
                    ))}
                </Grid>
            </TestimonialsContainer>
        </Section>
    );
};

export default Testimonials;
