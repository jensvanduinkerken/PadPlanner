"use client";

import { ReactNode } from "react";

interface FloatingButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  variant?: "default" | "active";
  ariaLabel: string;
  title?: string;
  hideOnDesktop?: boolean;
  showTextOnDesktop?: boolean;
  umamiEvent?: string;
  umamiEventData?: Record<string, string>;
}

export default function FloatingButton({
  onClick,
  children,
  className = "",
  variant = "default",
  ariaLabel,
  title,
  hideOnDesktop = false,
  showTextOnDesktop = false,
  umamiEvent,
  umamiEventData = {},
}: FloatingButtonProps) {
  const baseClasses = `h-10 w-10 rounded-lg transition-all flex items-center justify-center shadow-sm hover:shadow-md active:scale-95`;

  const variantClasses = {
    default:
      "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300",
    active: "bg-amber-700 text-white hover:bg-amber-800 shadow-md",
  };

  const responsiveClasses = hideOnDesktop
    ? "lg:hidden"
    : showTextOnDesktop
      ? "lg:w-fit lg:px-3 lg:gap-2"
      : "";

  const borderClasses = "";

  const umamiDataAttributes = Object.fromEntries(
    Object.entries(umamiEventData).map(([key, value]) => [
      `data-umami-event-${key}`,
      value,
    ]),
  );

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${responsiveClasses} ${borderClasses} ${className}`}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      data-umami-event={umamiEvent}
      {...umamiDataAttributes}
    >
      {children}
    </button>
  );
}
