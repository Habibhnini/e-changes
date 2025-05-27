import React from "react";

interface ProgressTimelineProps {
  currentStatus: string;
  hasDelivery?: boolean; // ← Add this prop
}

const getSteps = (hasDelivery: boolean) => [
  { key: "created", label: "Créé" },
  { key: "negotiation", label: "Négociation" },
  { key: "success", label: "Accepté" },
  { key: "validation", label: "Validé" },
  ...(hasDelivery ? [{ key: "delivery", label: "Livré" }] : []),
  { key: "completed", label: "Terminé" },
];

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  currentStatus,
  hasDelivery = true, // Default true
}) => {
  const steps = getSteps(hasDelivery);
  const currentIndex = steps.findIndex((step) => step.key === currentStatus);

  // Calculate the total width available for the line (container width minus padding)
  const containerPadding = 48; // 24px on each side
  const progressPercentage =
    currentIndex >= 0 ? currentIndex / (steps.length - 1) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      {/* Timeline container */}
      <div className="relative flex items-center justify-between">
        {/* Background line */}
        <div
          className="absolute top-6 h-0.5 bg-gradient-to-r from-gray-200 to-gray-300"
          style={{
            left: "24px",
            right: "24px",
          }}
        />

        {/* Progress line with gradient */}
        <div
          className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out"
          style={{
            width: `calc((100% - 48px) * ${progressPercentage})`,
          }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center relative group"
            >
              {/* Step circle with enhanced styling */}
              <div
                className={`relative w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-500 shadow-lg transform group-hover:scale-105 ${
                  isDone
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-200"
                    : isCurrent
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200 animate-pulse"
                    : "bg-white text-gray-500 border-2 border-gray-300 shadow-gray-100"
                }`}
              >
                {isDone ? (
                  // Checkmark for completed steps
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}

                {/* Glow effect for current step */}
                {isCurrent && (
                  <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping" />
                )}
              </div>

              {/* Step label with improved typography */}
              <div className="mt-3 text-center">
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isDone || isCurrent ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>

                {/* Status indicator */}
                {isCurrent && (
                  <div className="mt-1">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      En cours
                    </span>
                  </div>
                )}

                {isDone && (
                  <div className="mt-1">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                      Terminé
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Progression</span>
          <span className="font-semibold">
            {currentIndex >= 0 ? currentIndex + 1 : 0} / {steps.length}
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${
                currentIndex >= 0
                  ? ((currentIndex + 1) / steps.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default ProgressTimeline;
