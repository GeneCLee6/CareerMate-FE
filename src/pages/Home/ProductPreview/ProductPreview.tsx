import styled from "styled-components";
import { SectionContainer } from "../../../components/Section";
import { landingColors } from "../../../styles/tokens";
import previewImg from "../../../assets/features-showcase.png";

/** Shorter than the shared rhythm, so this section keeps its own padding. */
const Container = styled.section`
    width: 100%;
    background-color: ${landingColors.surface};
    padding: 80px 40px;
`;

const Content = styled(SectionContainer)`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const PreviewImage = styled.img`
    width: 100%;
    height: auto;
    display: block;
`;

/** The wide product screenshot between the hero and the problem/solution pitch. */
const ProductPreview = () => {
    return (
        <Container>
            <Content>
                <PreviewImage
                    src={previewImg}
                    alt="features-showcase"
                    aria-hidden="true"
                />
            </Content>
        </Container>
    );
};

export default ProductPreview;
