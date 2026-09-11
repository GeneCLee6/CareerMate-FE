import styled from "styled-components";
import { control, gradient } from "../../styles/tokens";

/**
 * The full-width gradient pill used as the primary action on every auth screen.
 */
const GradientButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: ${control.height};
    padding: 0 24px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 500;
    color: #fff;
    background: ${gradient};
    border: none;
    border-radius: ${control.radius};
    cursor: pointer;
    transition:
        box-shadow 0.2s ease,
        transform 0.2s ease;

    &:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba(80, 79, 253, 0.35);
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export default GradientButton;
