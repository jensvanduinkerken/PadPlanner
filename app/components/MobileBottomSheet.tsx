"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import SidebarForm from "./SidebarForm";
import { useLocationStore, useRouteFormStore, Mode } from "@/stores";

interface MobileBottomSheetProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function MobileBottomSheet({
  isOpen = false,
  onClose,
}: MobileBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef<number | null>(null);

  const startLocation = useLocationStore((s) => s.startLocation);
  const generatedRoute = useLocationStore((s) => s.generatedRoute);
  const { distance, mode } = useRouteFormStore();

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    // Allow dragging down to collapse
    if (isExpanded && deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY.current;

    setIsDragging(false);

    // Collapse if dragged down more than 50px
    if (deltaY > 50 && isExpanded) {
      setIsExpanded(false);
      setDragOffset(0);
    } else {
      setDragOffset(0);
    }
    touchStartY.current = null;
  };

  // Get location label
  const getLocationLabel = () => {
    if (startLocation) return "📍 Location set";
    return "📍 No location";
  };

  // Get distance label
  const getDistanceLabel = () => {
    if (mode === Mode.DISTANCE) return `${distance} km`;
    return `${distance} min`;
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] lg:hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={
        isExpanded
          ? {
              transform: `translateY(${dragOffset}px)`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
            }
          : {
              transform: "translateY(0)",
              transition: "none",
            }
      }
    >
      {/* Collapsed View */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-white border-t border-amber-100 shadow-2xl rounded-t-3xl p-4 flex items-center justify-between hover:bg-amber-50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm text-amber-600">{getLocationLabel()}</span>
            <span className="text-sm font-semibold text-amber-900">
              {generatedRoute ? getDistanceLabel() : distance}
            </span>
          </div>
          <ChevronUp
            size={20}
            className="text-amber-700 transition-transform"
          />
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-white rounded-t-3xl shadow-2xl border-t border-amber-100 max-h-[85vh] overflow-y-auto">
          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white rounded-t-3xl">
            <button
              onClick={() => setIsExpanded(false)}
              className="w-12 h-1 rounded-full bg-amber-200 hover:bg-amber-300 transition-colors"
            />
          </div>

          {/* Form Content */}
          <div className="px-4 pb-6">
            <SidebarForm />
          </div>
        </div>
      )}
    </div>
  );
}
