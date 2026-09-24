import { ReactNode, useId } from "react";
import styled from "styled-components";
import Modal from "../Modal";
import { colors } from "../../styles/tokens";

const Title = styled.h2`
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 700;
    color: ${colors.text};
    text-align: left;
`;

const Message = styled.div`
    margin: 0 0 28px;
    font-size: 14px;
    line-height: 1.5;
    color: ${colors.label};
    text-align: left;
    overflow-wrap: anywhere;
`;

const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
`;

const CancelButton = styled.button`
    height: 40px;
    padding: 0 24px;
    font-family: inherit;
    font-size: 14px;
    color: ${colors.text};
    background-color: #fff;
    border: 1px solid ${colors.border};
    border-radius: 20px;
    cursor: pointer;

    &:hover {
        background-color: #fafafa;
    }
`;

/** Red for an action that destroys something, dark for anything else. */
const ConfirmButton = styled.button<{ $danger: boolean }>`
    height: 40px;
    padding: 0 28px;
    font-family: inherit;
    font-size: 14px;
    color: #fff;
    background-color: ${({ $danger }) => ($danger ? colors.danger : colors.text)};
    border: none;
    border-radius: 20px;
    cursor: pointer;

    &:hover {
        opacity: 0.9;
    }
`;

export interface ConfirmDialogProps {
    title: string;
    message: ReactNode;
    confirmLabel: string;
    /** Styles the confirm button as destructive. */
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Asks before doing something the user cannot take back. A styled
 * replacement for `window.confirm`, which cannot be themed and reads as a
 * browser warning rather than part of the product.
 */
const ConfirmDialog = ({
    title,
    message,
    confirmLabel,
    danger = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    const titleId = useId();
    return (
        <Modal onClose={onCancel} labelledBy={titleId}>
            <Title id={titleId}>{title}</Title>
            <Message>{message}</Message>
            <Actions>
                <CancelButton type="button" onClick={onCancel}>
                    Cancel
                </CancelButton>
                <ConfirmButton type="button" $danger={danger} onClick={onConfirm}>
                    {confirmLabel}
                </ConfirmButton>
            </Actions>
        </Modal>
    );
};

export default ConfirmDialog;
