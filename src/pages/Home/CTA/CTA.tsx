import styled from "styled-components";

const Container = styled.section`
    width: 100%;
    background-color: #fff;
    padding: 100px 40px 0;
    margin-bottom: -80px;
    position: relative;
    z-index: 2;
`;

const CTAContainer = styled.div`
    background: linear-gradient(110deg, #504ffd 11%, #40c3fb 92%);
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
    color: #fff;
    margin: 0;
`;

const Subtitle = styled.p`
    font-size: 18px;
    font-weight: 400;
    line-height: 1.4;
    color: #cedaff;
    margin: 0;
`;

const Button = styled.a`
    display: inline-block;
    padding: 16px 36px;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    background-color: #000;
    border: none;
    border-radius: 28px;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 72px;

    &:hover {
        background-color: #333;
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
