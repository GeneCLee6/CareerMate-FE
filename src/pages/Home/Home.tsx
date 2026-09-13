import styled from "styled-components";
import { useEffect } from "react";
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
    // Arriving at "/#contact" from another page loads this route with the
    // fragment already in the URL, and nothing has rendered yet when the
    // browser would normally scroll. Do it once the sections exist.
    useEffect(() => {
        const { hash } = window.location;
        if (!hash) return;
        const target = document.getElementById(hash.slice(1));
        if (target) target.scrollIntoView({ behavior: "smooth" });
    }, []);

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
