import { Footprints } from "lucide-react";
import SidebarForm from "./SidebarForm";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const t = useTranslations("Sidebar");
  const locale = useLocale();
  const router = useRouter();
  const touchStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default true for SSR

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    // Only allow dragging down (positive delta)
    setDragOffset(Math.max(0, deltaY));
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY.current;

    setIsDragging(false);

    // Close if dragged more than 100px or 20% of drawer height
    if (deltaY > 100 && onClose) {
      // Animate out before closing
      setDragOffset(window.innerHeight);
      setTimeout(() => {
        onClose();
        setDragOffset(0);
      }, 200);
    } else {
      // Snap back
      setDragOffset(0);
    }
    touchStartY.current = null;
  };

  const handleLanguageChange = (newLocale: string) => {
    // Set the locale cookie
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`; // 1 year

    // Refresh the page to apply the new locale
    router.refresh();
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={
        isMobile
          ? {
              transform: isOpen
                ? `translateY(${dragOffset}px)`
                : "translateY(100%)",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }
          : undefined
      }
      className={`flex flex-col bg-white ${
        isMobile
          ? `fixed left-0 right-0 bottom-0 z-[10000] h-[75vh] overflow-y-auto rounded-t-3xl shadow-2xl border-t border-amber-100 ${!isOpen ? "pointer-events-none" : ""}`
          : "h-screen w-[360px] border-r border-amber-100"
      }`}
    >
      {/* Drag handle - only show on mobile */}
      {isMobile && (
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 rounded-full bg-amber-200"></div>
        </div>
      )}

      {/* Main content with proper spacing */}
      <div className={`flex flex-col flex-1 ${isMobile ? "p-4" : "p-6"} gap-6`}>
        {/* Header */}
        <header className="border-b border-amber-100 pb-4">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-amber-900">
              <Footprints size={24} />
              {t("title")}
            </h1>
            <select
              value={locale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-xs py-1 px-2 rounded-md border bg-white border-amber-200 text-amber-900"
              title={t("language")}
            >
              <option value="en">EN</option>
              <option value="nl">NL</option>
            </select>
          </div>
          <p className="text-sm text-amber-600">
            {t("subtitle")}{" "}
            <a
              className="underline hover:text-amber-700 font-medium"
              target="_blank"
              href="https://jens.vanduinkerken.net"
            >
              {t("authorLink")}
            </a>
          </p>
        </header>

        {/* Form for adjusting route generation settings */}
        <SidebarForm />

        {/* Footer */}
        <footer className="mt-auto border-t border-amber-100 pt-4 text-xs text-amber-700 leading-relaxed space-y-3">
          <h3 className="text-sm font-bold text-amber-900">
            {t("aboutTitle")}
          </h3>
          <p className="text-amber-700">{t("aboutDescription1")}</p>
          <p className="text-amber-700">{t("aboutDescription2")}</p>
        </footer>
      </div>
    </div>
  );
}
