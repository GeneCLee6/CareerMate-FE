import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Avatar from "../Avatar";
import Modal from "../Modal";
import { useToast } from "../Toast";
import { useAuth } from "../../context/AuthContext";
import { colors, fontFamily } from "../../styles/tokens";

const Wrapper = styled.div`
    position: relative;
    font-family: ${fontFamily};
`;

const Trigger = styled.button`
    display: flex;
    align-items: center;
    padding: 0;
    background: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;

    &:focus-visible {
        outline: 2px solid ${colors.borderFocus};
        outline-offset: 2px;
    }
`;

const Menu = styled.div`
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    z-index: 100;
    min-width: 220px;
    padding: 8px 0;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
`;

const Email = styled.p`
    margin: 0;
    padding: 10px 20px 14px;
    font-size: 14px;
    color: ${colors.text};
    border-bottom: 1px solid #f0f0f3;
    overflow-wrap: anywhere;
`;

const Item = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 20px;
    font-family: inherit;
    font-size: 14px;
    color: ${colors.text};
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;

    &:hover {
        background-color: #f6f7f9;
    }
`;

const ModalTitle = styled.h2`
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 700;
    color: ${colors.text};
    text-align: left;
`;

const ModalText = styled.p`
    margin: 0 0 28px;
    font-size: 14px;
    color: ${colors.label};
    text-align: left;
`;

const ModalActions = styled.div`
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

const ConfirmButton = styled.button`
    height: 40px;
    padding: 0 28px;
    font-family: inherit;
    font-size: 14px;
    color: #fff;
    background-color: #161616;
    border: none;
    border-radius: 20px;
    cursor: pointer;

    &:hover {
        background-color: #333;
    }
`;

const GearIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
);

const LogoutIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M15 12H3m12 0-4-4m4 4-4 4" />
        <path d="M10 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8" />
    </svg>
);

/**
 * Avatar button with the account dropdown, plus the logout confirmation and
 * the toast that follows it.
 */
const UserMenu = () => {
    const [open, setOpen] = useState(false);
    const [confirmingLogout, setConfirmingLogout] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { user, signOut } = useAuth();
    const showToast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    if (!user) return null;

    const confirmLogout = () => {
        setConfirmingLogout(false);
        signOut();
        showToast("You've been logged out successfully");
        navigate("/login", { replace: true });
    };

    return (
        <Wrapper ref={wrapperRef}>
            <Trigger
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Account menu"
            >
                <Avatar name={user.fullName} src={user.avatarUrl} size={34} />
            </Trigger>

            {open && (
                <Menu role="menu">
                    <Email>{user.email}</Email>
                    <Item
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            navigate("/settings");
                        }}
                    >
                        <GearIcon />
                        Personal Settings
                    </Item>
                    <Item
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            setConfirmingLogout(true);
                        }}
                    >
                        <LogoutIcon />
                        Logout
                    </Item>
                </Menu>
            )}

            {confirmingLogout && (
                <Modal
                    onClose={() => setConfirmingLogout(false)}
                    labelledBy="logout-title"
                >
                    <ModalTitle id="logout-title">Log Out</ModalTitle>
                    <ModalText>Are you sure you want to log out?</ModalText>
                    <ModalActions>
                        <CancelButton
                            type="button"
                            onClick={() => setConfirmingLogout(false)}
                        >
                            Cancel
                        </CancelButton>
                        <ConfirmButton type="button" onClick={confirmLogout}>
                            Confirm
                        </ConfirmButton>
                    </ModalActions>
                </Modal>
            )}
        </Wrapper>
    );
};

export default UserMenu;
