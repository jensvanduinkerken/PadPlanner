"use client";

// A button to toggle between time based or distance based generation

interface ToggleModeButtonProps {
  text: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function ToggleModeButton({
  text,
  selected,
  onClick,
  disabled = false,
}: ToggleModeButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`px-4 flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
        selected
          ? "bg-amber-700 text-white hover:bg-amber-800"
          : "bg-white hover:bg-amber-50 text-amber-900 border border-amber-300"
      } shadow-sm `}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
