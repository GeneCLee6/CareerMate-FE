import { useEffect, useId, useRef, useState } from "react";
import styled from "styled-components";
import {
    CircleAlert,
    CircleCheck,
    Clock,
    Download,
    Ellipsis,
    FileText,
    Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Icon from "../../components/Icon";
import { Resume, ResumeTextStatus } from "../../api/resumes";
import { colors } from "../../styles/tokens";

type Tone = "ok" | "warn" | "muted";

const TONE_COLORS: Record<Tone, string> = {
    ok: "#1f9d55",
    warn: "#b7791f",
    muted: colors.textMuted,
};

const Card = styled.li`
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 8px 10px 10px;
    background-color: #f6f7f9;
    border-radius: 10px;
`;

/** Marks the row as a document at a glance. */
const FileBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    color: #2f6bff;
    background-color: #e8effe;
    border-radius: 8px;
`;

const Text = styled.div`
    flex: 1;
    min-width: 0;
`;

const FileName = styled.p`
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    color: ${colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Status = styled.p<{ $tone: Tone }>`
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 2px 0 0;
    font-size: 11px;
    color: ${({ $tone }: { $tone: Tone }) => TONE_COLORS[$tone]};

    /* One line, so every card is the same height; the full text is in the title. */
    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    svg {
        flex-shrink: 0;
    }
`;

/** Always visible, so the actions are discoverable without hovering. */
const MenuButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    padding: 0;
    color: ${colors.label};
    background: none;
    border: none;
    border-radius: 7px;
    cursor: pointer;

    &:hover,
    &[aria-expanded="true"] {
        color: ${colors.text};
        background-color: #e9eaef;
    }

    &:focus-visible {
        outline: 2px solid ${colors.borderFocus};
        outline-offset: 1px;
    }
`;

/* Opens upwards: the resume section sits at the bottom of the screen. */
const Menu = styled.div`
    position: absolute;
    bottom: calc(100% - 4px);
    right: 6px;
    z-index: 10;
    min-width: 150px;
    padding: 6px;
    background-color: #fff;
    border: 1px solid #eceef2;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(22, 22, 22, 0.1);
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    font-family: inherit;
    font-size: 13px;
    text-align: left;
    color: ${({ $danger }) => ($danger ? colors.danger : colors.text)};
    background: none;
    border: none;
    border-radius: 7px;
    cursor: pointer;

    &:hover,
    &:focus-visible {
        background-color: ${({ $danger }) =>
            $danger ? colors.dangerSurface : "#f3f4f7"};
        outline: none;
    }
`;

/**
 * What the assistant can do with the file, in words. A resume the assistant
 * cannot read otherwise looks exactly like one it can, and the user only
 * finds out when the advice ignores it.
 */
const STATUS: Record<ResumeTextStatus, { text: string; tone: Tone; icon: LucideIcon }> = {
    ok: { text: "Read by the assistant", tone: "ok", icon: CircleCheck },
    empty: { text: "No text — scanned PDF?", tone: "warn", icon: CircleAlert },
    failed: { text: "Couldn't be read", tone: "warn", icon: CircleAlert },
    pending: { text: "Read when you next ask", tone: "muted", icon: Clock },
};

export interface ResumeCardProps {
    resume: Resume;
    onDownload: (resume: Resume) => void;
    /** Asks for confirmation before anything is deleted. */
    onRequestDelete: (resume: Resume) => void;
}

const ResumeCard = ({ resume, onDownload, onRequestDelete }: ResumeCardProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const cardRef = useRef<HTMLLIElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuId = useId();

    // Close on a click outside the card, or on Escape — and on Escape, hand
    // focus back to the button so a keyboard user is not left nowhere.
    useEffect(() => {
        if (!menuOpen) return undefined;
        const onPointerDown = (e: PointerEvent) => {
            if (!cardRef.current?.contains(e.target as Node)) setMenuOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMenuOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [menuOpen]);

    const status = STATUS[resume.textStatus ?? "pending"];

    const choose = (action: () => void) => {
        setMenuOpen(false);
        action();
    };

    return (
        <Card ref={cardRef}>
            <FileBadge>
                <Icon icon={FileText} size="md" />
            </FileBadge>
            <Text>
                <FileName title={resume.fileName}>{resume.fileName}</FileName>
                <Status $tone={status.tone} title={status.text}>
                    <Icon icon={status.icon} size="xs" />
                    <span>{status.text}</span>
                </Status>
            </Text>
            <MenuButton
                ref={buttonRef}
                type="button"
                aria-label={`Actions for ${resume.fileName}`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls={menuOpen ? menuId : undefined}
                onClick={() => setMenuOpen((open) => !open)}
            >
                <Icon icon={Ellipsis} size="lg" />
            </MenuButton>
            {menuOpen && (
                <Menu id={menuId} role="menu" aria-label={resume.fileName}>
                    <MenuItem
                        type="button"
                        role="menuitem"
                        onClick={() => choose(() => onDownload(resume))}
                    >
                        <Icon icon={Download} size="md" />
                        Download
                    </MenuItem>
                    <MenuItem
                        type="button"
                        role="menuitem"
                        $danger
                        onClick={() => choose(() => onRequestDelete(resume))}
                    >
                        <Icon icon={Trash2} size="md" />
                        Delete
                    </MenuItem>
                </Menu>
            )}
        </Card>
    );
};

export default ResumeCard;
