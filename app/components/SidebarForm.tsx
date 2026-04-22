"use client";

import { useState } from "react";
import { Clock, Ruler, Locate, LocateOff } from "lucide-react";
import ToggleModeButton from "./ToggleModeButton";
import GenerateRouteButton from "./GenerateRouteButton";
import AcceptRouteButton from "./AcceptRouteButton";
import ResetRouteButton from "./ResetRouteButton";
import { useLocationStore, Mode, Pace, useRouteFormStore } from "../../stores";
import LocationSearch from "./LocationSearch";
import { useRouteGeneration } from "../hooks/useRouteGeneration";
import { useTranslations } from "next-intl";

export default function SidebarForm() {
  const t = useTranslations("SidebarForm");

  const {
    setStartLocation,
    setUserLocation,
    generatedRoute,
    resetRoute,
    acceptRoute,
    isRouteAccepted,
  } = useLocationStore();

  const { mode, pace, distance, time, setMode, setPace, setDistance, setTime } =
    useRouteFormStore();

  const { generateRoute, isGeneratingRoute } = useRouteGeneration();

  // Local state for location functionality
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const handleLocationSelect = (location: { lat: number; lon: number }) => {
    const newLocation: [number, number] = [location.lat, location.lon];
    setStartLocation(newLocation);
  };

  const handleGenerateRoute = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const distanceInput = formData.get("distance") as string;
    const timeInput = formData.get("time") as string;

    // Call the hook's generateRoute function with form data
    await generateRoute({
      distance: distanceInput,
      time: timeInput,
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t("geolocationNotSupported"));
      setLocationError(true);
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [latitude, longitude];
        setUserLocation(newLocation);
        setIsGettingLocation(false);
        setLocationError(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(t("locationError"));
        setIsGettingLocation(false);
        setLocationError(true);
      },
    );
  };

  const paceOptions = [
    { value: Pace.WALKING, label: t("walkingPace") },
    { value: Pace.RUNNING, label: t("runningPace") },
    { value: Pace.CYCLING, label: t("cyclingPace") },
  ];

  const paceItems = paceOptions.map((pace) => (
    <option
      key={pace.value}
      value={pace.value}
    >
      {pace.label}
    </option>
  ));

  const handleAcceptRoute = () => {
    acceptRoute();
  };

  const handleResetRoute = () => {
    resetRoute();
  };

  return (
    <form
      onSubmit={handleGenerateRoute}
      className="flex flex-col gap-5 flex-grow"
    >
      {/* Mode Toggle */}
      <section className="card p-4 space-y-3">
        <h2 className="section-title text-base">⚙️ {t("routeSettings")}</h2>
      <div className="w-full flex gap-2">
        <ToggleModeButton
          text={t("distanceMode")}
          selected={mode === Mode.DISTANCE}
          disabled={!!generatedRoute}
          onClick={() => {
            setMode(Mode.DISTANCE);
          }}
        />
        <ToggleModeButton
          text={t("timeMode")}
          selected={mode === Mode.TIME}
          disabled={!!generatedRoute}
          onClick={() => {
            setMode(Mode.TIME);
          }}
        />
      </div>
      <div className="flex flex-col gap-4">
        {mode === Mode.DISTANCE ? (
          <div>
            {/* Distance specific fields */}
            <label
              htmlFor="distance"
              className="block text-sm font-medium mb-1"
            >
              {t("desiredDistance")}
            </label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 h-4 w-4" />
              <input
                id="distance"
                name="distance"
                type="number"
                step="0.1"
                min="0.1"
                value={distance}
                disabled={!!generatedRoute}
                onChange={(e) => {
                  setDistance(e.target.value);
                }}
                placeholder={t("distancePlaceholder")}
                required
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Time specific fields */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-1">
                {t("desiredDuration")}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 h-4 w-4" />
                <input
                  id="time"
                  name="time"
                  type="number"
                  min="1"
                  value={time}
                  disabled={!!generatedRoute}
                  onChange={(e) => {
                    setTime(e.target.value);
                  }}
                  placeholder={t("timePlaceholder")}
                  required
                />
              </div>
            </div>
            <div>
              {/* Pacing selector */}
              <label htmlFor="pace" className="block text-sm font-medium mb-1 ">
                {t("pace")}
              </label>
              <select
                className="w-full p-2 border rounded bg-white border-amber-200 text-amber-900"
                disabled={!!generatedRoute}
                onChange={(e) => {
                  setPace(e.target.value as Pace);
                }}
                value={pace}
                id="pace"
                name="pace"
              >
                {paceItems}
              </select>
            </div>
          </div>
        )}
      </div>
      </section>

      {/* Location Card */}
      <section className="card p-4 space-y-3">
        <h2 className="section-title text-base">📍 {t("startingLocation")}</h2>
          <div className="flex gap-1">
            <div className="flex-1">
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                placeholder={t("searchLocationPlaceholder")}
                disabled={!!generatedRoute}
              />
            </div>
            <button
              type="button"
              title={t("useCurrentLocation")}
              aria-label={t("useCurrentLocation")}
              onClick={getCurrentLocation}
              disabled={isGettingLocation || locationError || !!generatedRoute}
              className="px-3 py-2 bg-white hover:bg-amber-50 border border-amber-200 rounded-md text-amber-900 flex items-center transition-colors"
              data-umami-event="Use current location"
              data-umami-event-source="sidebar"
            >
              {locationError ? (
                <LocateOff size={16} />
              ) : (
                <Locate
                  size={16}
                  className={isGettingLocation ? "animate-spin" : ""}
                />
              )}
            </button>
          </div>
      </section>

      {/* Action Buttons */}
      <div className="mt-auto pt-4">
          {generatedRoute ? (
            <div className="flex gap-2 flex-wrap">
              {!isRouteAccepted && (
                <AcceptRouteButton
                  onAccept={handleAcceptRoute}
                  className="flex-1"
                  umamiEventData={{ source: "sidebar" }}
                />
              )}
              <ResetRouteButton
                onReset={handleResetRoute}
                className="flex-1"
                umamiEventData={{ source: "sidebar" }}
              />
            </div>
          ) : (
            <GenerateRouteButton
              isGeneratingRoute={isGeneratingRoute}
              umamiEventData={{ source: "sidebar" }}
              className="w-full"
            />
          )}
      </div>
    </form>
  );
}
