"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface ResetRouteButtonProps {
  onReset: () => void;
  disabled?: boolean;
  className?: string;
  umamiEventName?: string;
  umamiEventData?: Record<string, string>;
}

export default function ResetRouteButton({
  onReset,
  disabled = false,
  className = "",
  umamiEventName = "Reset route",
  umamiEventData = {},
}: ResetRouteButtonProps) {
  const t = useTranslations("ResetRouteButton");

  const umamiDataAttributes = Object.fromEntries(
    Object.entries(umamiEventData).map(([key, value]) => [
      `data-umami-event-${key}`,
      value,
    ]),
  );

  return (
    <button
      type="button"
      onClick={onReset}
      disabled={disabled}
      className={`bg-amber-800 hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-95 flex justify-center items-center ${className}`}
      data-umami-event={umamiEventName}
      {...umamiDataAttributes}
    >
      <RotateCcw className="inline-block mr-2" size={18} />
      {t("reset")}
    </button>
  );
}
