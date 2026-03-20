"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface AcceptRouteButtonProps {
  onAccept: () => void;
  disabled?: boolean;
  className?: string;
  umamiEventName?: string;
  umamiEventData?: Record<string, string>;
}

export default function AcceptRouteButton({
  onAccept,
  disabled = false,
  className = "",
  umamiEventName = "Accept route",
  umamiEventData = {},
}: AcceptRouteButtonProps) {
  const t = useTranslations("AcceptRouteButton");

  const umamiDataAttributes = Object.fromEntries(
    Object.entries(umamiEventData).map(([key, value]) => [
      `data-umami-event-${key}`,
      value,
    ]),
  );

  return (
    <button
      type="button"
      onClick={onAccept}
      disabled={disabled}
      className={`btn-primary flex justify-center items-center ${className}`}
      data-umami-event={umamiEventName}
      {...umamiDataAttributes}
    >
      <Check className="inline-block mr-2" size={18} />
      {t("accept")}
    </button>
  );
}
