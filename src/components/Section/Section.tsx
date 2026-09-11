import styled from "styled-components";
import { landingColors, landingLayout } from "../../styles/tokens";

/**
 * The full-bleed white band most landing sections sit in. Sections that need a
 * different backdrop or rhythm (the hero, contact and the closing CTA) style
 * their own wrapper rather than fighting this one.
 */
export const Section = styled.section`
    width: 100%;
    background-color: ${landingColors.surface};
    padding: ${landingLayout.sectionPadding};
`;

/**
 * Centred content column. Defaults to the wide measure; sections that use the
 * narrower one extend it, e.g. styled(SectionContainer)`max-width: 1200px;`.
 */
export const SectionContainer = styled.div`
    max-width: ${landingLayout.contentMaxWidth};
    margin: 0 auto;
`;
