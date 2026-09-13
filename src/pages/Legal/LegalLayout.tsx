import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import {
    landingColors,
    landingGradients,
    landingLayout,
} from "../../styles/tokens";

/** Matches the fixed navbar the landing page already offsets for. */
const NAVBAR_HEIGHT = 62;

const Page = styled.div`
    margin-top: ${NAVBAR_HEIGHT}px;
    background-color: ${landingColors.surface};
    color: ${landingColors.body};
`;

const Masthead = styled.header`
    background: ${landingGradients.hero};
    border-bottom: 1px solid ${landingColors.border};
    padding: 72px 40px 56px;

    @media (max-width: ${landingLayout.mobile}) {
        padding: 48px 20px 36px;
    }
`;

const MastheadInner = styled.div`
    max-width: ${landingLayout.contentMaxWidthNarrow};
    margin: 0 auto;
`;

const Eyebrow = styled.p`
    margin: 0 0 12px;
    width: fit-content;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    /* The only place the brand gradient appears here: enough to tie the page
       to the product, without dressing up a legal document. */
    background: ${landingGradients.primary};
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const Title = styled.h1`
    margin: 0 0 16px;
    font-size: 52px;
    font-weight: 900;
    line-height: 1.1;
    color: ${landingColors.heading};

    @media (max-width: ${landingLayout.mobile}) {
        font-size: 34px;
    }
`;

const Summary = styled.p`
    max-width: 680px;
    margin: 0 0 24px;
    font-size: 17px;
    line-height: 1.7;
    color: ${landingColors.muted};
`;

const Updated = styled.p`
    display: inline-flex;
    align-items: center;
    margin: 0;
    padding: 6px 14px;
    font-size: 13px;
    color: ${landingColors.muted};
    background-color: ${landingColors.surface};
    border: 1px solid ${landingColors.border};
    border-radius: 999px;
`;

const Layout = styled.div`
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 64px;
    max-width: ${landingLayout.contentMaxWidthNarrow};
    margin: 0 auto;
    padding: 64px 40px 96px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 32px;
        padding: 40px 20px 64px;
    }
`;

/** Sticks beside the text on desktop; a plain list on narrow screens. */
const Contents = styled.nav`
    position: sticky;
    top: ${NAVBAR_HEIGHT + 32}px;
    align-self: start;

    @media (max-width: 900px) {
        position: static;
        padding-bottom: 24px;
        border-bottom: 1px solid ${landingColors.border};
    }
`;

const ContentsTitle = styled.p`
    margin: 0 0 14px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${landingColors.muted};
`;

const ContentsList = styled.ol`
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: section;
`;

const ContentsItem = styled.li`
    counter-increment: section;
    margin-bottom: 2px;
`;

const ContentsLink = styled.a<{ $active: boolean }>`
    display: block;
    padding: 7px 12px;
    font-size: 14px;
    line-height: 1.4;
    text-decoration: none;
    color: ${({ $active }) =>
        $active ? landingColors.heading : landingColors.muted};
    font-weight: ${({ $active }) => ($active ? 600 : 400)};
    background-color: ${({ $active }) =>
        $active ? landingColors.surfaceSubtle : "transparent"};
    border-radius: 8px;

    &::before {
        content: counter(section) ". ";
        color: ${landingColors.placeholder};
    }

    &:hover {
        color: ${landingColors.heading};
        background-color: ${landingColors.surfaceSubtle};
    }
`;

const Article = styled.article`
    min-width: 0;
    font-size: 16px;
    line-height: 1.8;

    p {
        margin: 0 0 18px;
    }

    ul {
        margin: 0 0 18px;
        padding-left: 22px;
    }

    li {
        margin-bottom: 10px;
    }

    strong {
        color: ${landingColors.heading};
        font-weight: 600;
    }

    a {
        color: #2f6bff;
    }

    code {
        padding: 2px 6px;
        font-size: 14px;
        background-color: ${landingColors.surfaceSubtle};
        border-radius: 4px;
    }

    table {
        width: 100%;
        margin: 0 0 20px;
        border-collapse: separate;
        border-spacing: 0;
        font-size: 15px;
        border: 1px solid ${landingColors.border};
        border-radius: 12px;
        overflow: hidden;
    }

    th,
    td {
        padding: 14px 16px;
        text-align: left;
        vertical-align: top;
        border-bottom: 1px solid ${landingColors.border};
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    th {
        background-color: ${landingColors.surfaceSubtle};
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        color: ${landingColors.heading};
    }
`;

const SectionBlock = styled.section`
    /* Clears the fixed navbar when a heading is jumped to. */
    scroll-margin-top: ${NAVBAR_HEIGHT + 24}px;

    & + & {
        margin-top: 48px;
        padding-top: 40px;
        border-top: 1px solid ${landingColors.border};
    }
`;

const SectionHeading = styled.h2`
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin: 0 0 16px;
    font-size: 24px;
    font-weight: 700;
    color: ${landingColors.heading};
`;

const SectionNumber = styled.span`
    font-size: 14px;
    font-weight: 700;
    color: ${landingColors.placeholder};
`;

/** Closes the page with somewhere to go, rather than stopping mid-sentence. */
const ContactCard = styled.div`
    margin-top: 56px;
    padding: 32px;
    background-color: ${landingColors.surfaceContact};
    border: 1px solid ${landingColors.border};
    border-radius: 20px;

    h3 {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 700;
        color: ${landingColors.heading};
    }

    p {
        margin: 0 0 20px;
        color: ${landingColors.muted};
    }
`;

const ContactActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
`;

const PrimaryAction = styled.a`
    /* Doubled so it outranks the "Article a" rule above, which is a more
       specific selector than a single generated class and was colouring this
       text blue on a blue gradient. */
    && {
        color: ${landingColors.onGradient};
    }

    display: inline-flex;
    align-items: center;
    height: 44px;
    padding: 0 24px;
    font-size: 14px;
    font-weight: 500;
    background: ${landingGradients.primary};
    border-radius: 22px;
    text-decoration: none;
`;

const SecondaryAction = styled(Link)`
    && {
        color: ${landingColors.heading};
    }

    display: inline-flex;
    align-items: center;
    height: 44px;
    padding: 0 24px;
    font-size: 14px;
    font-weight: 500;
    background-color: ${landingColors.surface};
    border: 1px solid ${landingColors.border};
    border-radius: 22px;
    text-decoration: none;

    &:hover {
        border-color: ${landingColors.heading};
    }
`;

export interface LegalSection {
    id: string;
    title: string;
    body: ReactNode;
}

export interface LegalLayoutProps {
    eyebrow: string;
    title: string;
    summary: ReactNode;
    updated: string;
    sections: LegalSection[];
    contactEmail: string;
}

/**
 * Shared shell for the terms and privacy pages.
 *
 * Sections arrive as data rather than as markup, so the contents list is
 * generated from them: a heading cannot go missing from the navigation, and an
 * anchor cannot point at a section that no longer exists.
 *
 * It uses the landing page's own Navbar and Footer rather than a reduced
 * header of its own. These pages are part of the site, not a printout — a
 * reader should be able to get anywhere from here, and the account menu should
 * still be there if they are signed in.
 */
const LegalLayout = ({
    eyebrow,
    title,
    summary,
    updated,
    sections,
    contactEmail,
}: LegalLayoutProps) => {
    const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

    // Highlights the section being read.
    //
    // "Whichever section intersects" is not enough: near a boundary both the
    // one ending and the one starting intersect, and picking the topmost
    // names the one you have just finished. The reader is in the last section
    // whose heading has passed the line, so that is what is measured.
    useEffect(() => {
        const line = NAVBAR_HEIGHT + 120;

        const pick = () => {
            let current = sections[0]?.id ?? "";
            for (const { id } of sections) {
                const element = document.getElementById(id);
                if (element && element.getBoundingClientRect().top <= line) {
                    current = id;
                }
            }
            setActiveId(current);
        };

        // The observer is only a cheap trigger — no listener runs per frame,
        // and pick() does the deciding.
        const observer = new IntersectionObserver(pick, {
            threshold: [0, 0.25, 0.5, 0.75, 1],
        });
        sections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        pick();
        return () => observer.disconnect();
    }, [sections]);

    return (
        <>
            <Navbar />
            <Page>
                <Masthead>
                    <MastheadInner>
                        <Eyebrow>{eyebrow}</Eyebrow>
                        <Title>{title}</Title>
                        <Summary>{summary}</Summary>
                        <Updated>Last updated {updated}</Updated>
                    </MastheadInner>
                </Masthead>

                <Layout>
                    <Contents aria-label="On this page">
                        <ContentsTitle>On this page</ContentsTitle>
                        <ContentsList>
                            {sections.map((section) => (
                                <ContentsItem key={section.id}>
                                    <ContentsLink
                                        href={`#${section.id}`}
                                        $active={section.id === activeId}
                                        aria-current={
                                            section.id === activeId
                                                ? "true"
                                                : undefined
                                        }
                                    >
                                        {section.title}
                                    </ContentsLink>
                                </ContentsItem>
                            ))}
                        </ContentsList>
                    </Contents>

                    <Article>
                        {sections.map((section, index) => (
                            <SectionBlock key={section.id} id={section.id}>
                                <SectionHeading>
                                    <SectionNumber aria-hidden="true">
                                        {String(index + 1).padStart(2, "0")}
                                    </SectionNumber>
                                    {section.title}
                                </SectionHeading>
                                {section.body}
                            </SectionBlock>
                        ))}

                        <ContactCard>
                            <h3>Questions about this page?</h3>
                            <p>
                                CareerMate AI is a student project, and the
                                person who built it reads this inbox.
                            </p>
                            <ContactActions>
                                <PrimaryAction href={`mailto:${contactEmail}`}>
                                    Email {contactEmail}
                                </PrimaryAction>
                                <SecondaryAction to="/">
                                    Back to CareerMate AI
                                </SecondaryAction>
                            </ContactActions>
                        </ContactCard>
                    </Article>
                </Layout>
            </Page>
            <Footer />
        </>
    );
};

export default LegalLayout;
