import styled from "styled-components";
import Navbar from "./Navbar";
import Hero from "./Hero";
import ProductPreview from "./ProductPreview";
import ProblemSolution from "./ProblemSolution";
import FeaturesShowcase from "./FeaturesShowcase";
import AIAction from "./AIAction";
import AIEngineer from "./AIEngineer";
import Testimonials from "./Testimonials";
import ContactSection from "./ContactSection";
import CTA from "./CTA";
import Footer from "./Footer";
import BackToTop from "../../components/BackToTop";

const MainContent = styled.main`
    margin-top: 62px;
    min-height: calc(100vh - 62px);
`;

const Home = () => {
    return (
        <>
            <Navbar />
            <MainContent>
                <Hero />
                <ProductPreview />
                <ProblemSolution />
                <FeaturesShowcase />
                <AIAction />
                <AIEngineer />
                <Testimonials />
                <ContactSection />
                <CTA />
            </MainContent>
            <Footer />
            <BackToTop />
        </>
    );
};

export default Home;
