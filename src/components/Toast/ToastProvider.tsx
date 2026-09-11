import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import styled, { keyframes } from "styled-components";
import { colors, fontFamily } from "../../styles/tokens";

const fadeIn = keyframes`
    from { opacity: 0; transform: translate(-50%, -6px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
`;

const Pill = styled.div`
    position: fixed;
    top: 96px;
    left: 50%;
    z-index: 2000;
    padding: 14px 28px;
    font-family: ${fontFamily};
    font-size: 14px;
    color: #fff;
    background-color: ${colors.toast};
    border-radius: 999px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    animation: ${fadeIn} 0.2s ease-out;
`;

type ShowToast = (message: string, durationMs?: number) => void;

const ToastContext = createContext<ShowToast | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [message, setMessage] = useState<string | null>(null);
    const timerRef = useRef<number | undefined>(undefined);

    const showToast = useCallback<ShowToast>((next, durationMs = 2500) => {
        window.clearTimeout(timerRef.current);
        setMessage(next);
        timerRef.current = window.setTimeout(
            () => setMessage(null),
            durationMs
        );
    }, []);

    useEffect(() => () => window.clearTimeout(timerRef.current), []);

    const value = useMemo(() => showToast, [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            {message && (
                <Pill role="status" aria-live="polite">
                    {message}
                </Pill>
            )}
        </ToastContext.Provider>
    );
};

export function useToast(): ShowToast {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used inside a ToastProvider");
    }
    return context;
}
