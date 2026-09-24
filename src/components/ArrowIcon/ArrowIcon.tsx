import { ArrowRight } from "lucide-react";
import Icon, { IconSize } from "../Icon";

export interface ArrowIconProps {
    size?: IconSize;
}

/** The forward arrow used on call-to-action buttons. */
const ArrowIcon = ({ size = "xl" }: ArrowIconProps) => (
    <Icon icon={ArrowRight} size={size} />
);

export default ArrowIcon;
