import styled from "styled-components";
import GradientButton from "../../components/GradientButton";
import { colors } from "../../styles/tokens";

/** Shared chrome for the three settings panels. */

export const PanelTitle = styled.h2`
    margin: 0 0 32px;
    font-size: 20px;
    font-weight: 400;
    color: ${colors.text};
`;

export const PanelForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 500px;
`;

export const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const FieldLabel = styled.label`
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 14px;
    color: ${colors.text};
`;

export const Optional = styled.span`
    font-size: 12px;
    color: ${colors.placeholder};
`;

export const Hint = styled.p`
    margin: -4px 0 0;
    font-size: 12px;
    color: ${colors.placeholder};
`;

/** Softer corners than the auth pill inputs, matching the settings design. */
export const settingsInputRadius = "10px";

export const SaveButton = styled(GradientButton)`
    width: auto;
    align-self: flex-start;
    min-width: 180px;
    margin-top: 8px;
`;

export const Divider = styled.hr`
    margin: 8px 0 0;
    border: none;
    border-top: 1px solid #eceef2;
`;

export const SubheadRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const Subhead = styled.h3`
    margin: 0;
    font-size: 15px;
    font-weight: 400;
    color: ${colors.text};
`;
