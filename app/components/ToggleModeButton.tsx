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
      className={`px-4 flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
        selected
          ? "bg-amber-700 text-white hover:bg-amber-800 shadow-md active:scale-95"
          : "bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-300 hover:border-amber-400 active:scale-95"
      }`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
