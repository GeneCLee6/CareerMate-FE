import { ReactNode, useEffect } from "react";
import styled from "styled-components";
import { fontFamily } from "../../styles/tokens";

const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    z-index: 1500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background-color: rgba(22, 22, 22, 0.35);
`;

const Card = styled.div`
    font-family: ${fontFamily};
    width: 100%;
    max-width: 360px;
    padding: 32px;
    text-align: center;
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
`;

export interface ModalProps {
    children: ReactNode;
    onClose: () => void;
    labelledBy?: string;
}

const Modal = ({ children, onClose, labelledBy }: ModalProps) => {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    return (
        <Backdrop
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
        >
            <Card onClick={(e) => e.stopPropagation()}>{children}</Card>
        </Backdrop>
    );
};

export default Modal;
