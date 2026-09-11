import styled from "styled-components";
import actionLeftBgImg from "../../../assets/action-left-bg.png";
import chatInterfaceImg from "../../../assets/action-chat-interface.png";

const Container = styled.section`
    width: 100%;
    background-color: #fff;
    padding: 100px 40px;
`;

const ActionContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 40px;
    }
`;

const Left = styled.div`
    display: flex;
    flex-direction: column;
`;

const Title = styled.h2`
    font-size: 48px;
    font-weight: 700;
    line-height: 1.3;
    margin: 0 0 40px 0;
`;

const Background = styled.div`
    width: 100%;
    position: relative;
`;

const BackgroundImage = styled.img`
    width: 100%;
    height: auto;
    display: block;
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ChatInterfaceImage = styled.img`
    width: 100%;
    height: auto;
    display: block;
    max-width: 600px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
`;

const AIAction = () => {
    return (
        <Container id="demo">
            <ActionContainer>
                <Left>
                    <Title>See CareerMate AI in Action</Title>
                    <Background>
                        <BackgroundImage
                            src={actionLeftBgImg}
                            alt="AI Action Background"
                        />
                    </Background>
                </Left>
                <Right>
                    <ChatInterfaceImage
                        src={chatInterfaceImg}
                        alt="AI Assistant Chat"
                    />
                </Right>
            </ActionContainer>
        </Container>
    );
};

export default AIAction;
