import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { ArrowUp } from "lucide-react";
import Icon from "../Icon";

const Button = styled.button<{ $visible: boolean }>`
    position: fixed;
    bottom: 40px;
    right: 40px;
    width: 56px;
    height: 56px;
    background-color: #fff;
    border: none;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};
    z-index: 1000;
`;

const BackToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300);

        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <Button
            type="button"
            id="backToTop"
            aria-label="Back to top"
            $visible={visible}
            onClick={scrollToTop}
        >
            <Icon icon={ArrowUp} size="xxl" />
        </Button>
    );
};

export default BackToTop;
