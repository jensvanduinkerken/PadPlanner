"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface MapLoadingOverlayProps {
  isVisible: boolean;
}

export default function MapLoadingOverlay({
  isVisible,
}: MapLoadingOverlayProps) {
  const t = useTranslations("MapLoadingOverlay");

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-[1000] rounded-lg">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl max-w-xs">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-amber-900 mb-1">
            {t("generatingRoute")}
          </h3>
          <p className="text-sm text-amber-600">
            {t("pleaseWait")}
          </p>
        </div>
      </div>
    </div>
  );
}
