import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Avatar from "../Avatar";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import Icon from "../Icon";
import Modal from "../Modal";
import { useToast } from "../Toast";
import { useAuth } from "../../context/AuthContext";
import { colors, fontFamily } from "../../styles/tokens";

const Wrapper = styled.div`
    position: relative;
    font-family: ${fontFamily};
`;

const Trigger = styled.button<{ $withName: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0;
    background: none;
    border: none;
    border-radius: ${({ $withName }) => ($withName ? "20px" : "50%")};
    cursor: pointer;

    &:focus-visible {
        outline: 2px solid ${colors.borderFocus};
        outline-offset: 2px;
    }
`;

const TriggerName = styled.span`
    font-size: 15px;
    font-weight: 700;
    color: ${colors.text};
    white-space: nowrap;
`;

const Caret = styled.span<{ $open: boolean }>`
    display: flex;
    color: ${colors.text};
    transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
    transition: transform 0.2s ease;
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

export interface UserMenuProps {
    /**
     * "app" is the signed-in shell: avatar only, with the email and a link to
     * Personal Settings above Logout. "landing" is the marketing navbar, which
     * shows the name beside the avatar and offers Logout alone.
     */
    variant?: "app" | "landing";
}

/**
 * Avatar button with the account dropdown, plus the logout confirmation and
 * the toast that follows it.
 */
const UserMenu = ({ variant = "app" }: UserMenuProps) => {
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
                $withName={variant === "landing"}
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Account menu"
            >
                <Avatar name={user.fullName} src={user.avatarUrl} size={34} />
                {variant === "landing" && (
                    <>
                        <TriggerName>
                            {user.displayName || user.fullName}
                        </TriggerName>
                        <Caret $open={open}>
                            <Icon icon={ChevronDown} size="xs" />
                        </Caret>
                    </>
                )}
            </Trigger>

            {open && (
                <Menu role="menu">
                    {variant === "app" && (
                        <>
                            <Email>{user.email}</Email>
                            <Item
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setOpen(false);
                                    navigate("/settings");
                                }}
                            >
                                <Icon icon={Settings} size="lg" />
                                Personal Settings
                            </Item>
                        </>
                    )}
                    <Item
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            setConfirmingLogout(true);
                        }}
                    >
                        <Icon icon={LogOut} size="lg" />
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
