import styled from "styled-components";
import { colors } from "../../styles/tokens";

const Circle = styled.span<{ $size: number }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
    font-size: ${({ $size }) => Math.round($size * 0.4)}px;
    font-weight: 600;
    color: ${colors.label};
    background-color: #e8eaf1;
    border-radius: 50%;
    overflow: hidden;
    user-select: none;
`;

const Image = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
`;

/**
 * First letters of the first two words, e.g. "Ray Zhang" -> "RZ".
 *
 * Tolerates a missing name. This component renders in the header on every
 * signed-in screen, so a partial user object used to take the whole page down
 * with "Cannot read properties of undefined (reading 'trim')" — an avatar is
 * never worth a blank screen.
 */
function initialsOf(name: string | null | undefined): string {
    return (name ?? "")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}

export interface AvatarProps {
    name: string | null | undefined;
    src?: string | null;
    size?: number;
    className?: string;
}

/** Round profile image, falling back to initials when there is no avatar. */
const Avatar = ({ name, src, size = 32, className }: AvatarProps) => (
    <Circle $size={size} className={className} aria-hidden="true">
        {src ? <Image src={src} alt="" /> : initialsOf(name)}
    </Circle>
);

export default Avatar;
