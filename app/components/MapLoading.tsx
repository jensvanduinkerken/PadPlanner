import { useTranslations } from "next-intl";

export default function MapLoading() {
  const t = useTranslations("MapLoading");

  return (
    <div className="h-full w-full bg-gradient-to-br from-amber-50 via-white to-amber-50 flex flex-col items-center justify-center">
      {/* Logo with animation */}
      <div className="flex flex-col items-center">
        <div className="relative mb-6 text-8xl animate-pulse">
          🥾
        </div>

        {/* App title */}
        <h1 className="text-4xl font-bold text-amber-900 mb-3 animate-fade-in">
          PadPlanner
        </h1>

        {/* Loading text */}
        <p className="text-amber-700 text-lg animate-fade-in">
          {t("loadingText")}
        </p>
      </div>

      {/* Loading dots animation */}
      <div className="flex space-x-3 mt-8">
        <div className="w-3 h-3 bg-amber-700 rounded-full animate-bounce"></div>
        <div
          className="w-3 h-3 bg-amber-600 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
}
