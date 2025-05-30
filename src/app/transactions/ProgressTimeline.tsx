import React from "react";

interface ProgressTimelineProps {
  currentStatus: string;
  hasDelivery?: boolean;
}

const getSteps = (hasDelivery: boolean) => {
  const baseSteps = [
    { key: "created", label: "Créé" },
    { key: "negotiation", label: "Négociation" },
    { key: "success", label: "Accepté" },
    { key: "validation", label: "Validé" },
  ];

  if (hasDelivery) {
    return [
      ...baseSteps,
      { key: "completed", label: "Payé" },
      { key: "delivery", label: "Livré" },
    ];
  } else {
    return [...baseSteps, { key: "completed", label: "Payé" }];
  }
};

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  currentStatus,
  hasDelivery = true,
}) => {
  const steps = getSteps(hasDelivery);
  const currentIndex = steps.findIndex((step) => step.key === currentStatus);

  const progressPercentage =
    currentIndex >= 0 ? currentIndex / (steps.length - 1) : 0;

  const renderStep = (step: any, index: number, isMobile = false) => {
    const isDone =
      index < currentIndex ||
      (currentStatus === "delivery" && step.key === "delivery") ||
      (currentStatus === "completed" && step.key === "completed");
    const isCurrent =
      index === currentIndex &&
      currentStatus !== "delivery" &&
      currentStatus !== "completed";

    return (
      <div
        key={step.key}
        className="flex flex-col items-center relative flex-1"
      >
        {/* Step circle */}
        <div
          className={`relative ${
            isMobile ? "w-10 h-10" : "w-12 h-12"
          } rounded-full flex items-center justify-center font-semibold ${
            isMobile ? "text-xs" : "text-sm"
          } transition-all duration-500 shadow-lg ${
            !isMobile ? "transform group-hover:scale-105" : ""
          } ${
            isDone
              ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-200"
              : isCurrent
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200 animate-pulse"
              : "bg-white text-gray-500 border-2 border-gray-300 shadow-gray-100"
          }`}
        >
          {isDone ? (
            <svg
              className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`}
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

        {/* Step label */}
        <div className={`${isMobile ? "mt-2" : "mt-3"} text-center px-1`}>
          <span
            className={`${
              isMobile ? "text-xs" : "text-sm"
            } font-medium transition-colors duration-300 leading-tight block ${
              isDone || isCurrent ? "text-gray-800" : "text-gray-500"
            }`}
          >
            {step.label}
          </span>

          {/* Status indicator */}
          {isCurrent && (
            <div className="mt-1">
              <span
                className={`inline-block ${
                  isMobile ? "px-1.5 py-0.5" : "px-2 py-1"
                } text-xs font-medium bg-blue-100 text-blue-800 rounded-full`}
              >
                En cours
              </span>
            </div>
          )}

          {isDone && (
            <div className="mt-1">
              <span
                className={`inline-block ${
                  isMobile ? "px-1.5 py-0.5" : "px-2 py-1"
                } text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full`}
              >
                Terminé
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      {/* Desktop view */}
      <div className="hidden md:block relative">
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div
            className="absolute top-6 h-0.5 bg-gradient-to-r from-gray-200 to-gray-300"
            style={{
              left: "24px",
              right: "24px",
            }}
          />

          {/* Progress line */}
          <div
            className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out"
            style={{
              width: `calc((100% - 48px) * ${progressPercentage})`,
            }}
          />

          {/* Steps */}
          {steps.map((step, index) => renderStep(step, index, false))}
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        {/* First row - first 3 steps */}
        <div className="flex items-center justify-between mb-8 relative">
          {/* Background line for first row */}
          <div
            className="absolute top-5 h-0.5 bg-gradient-to-r from-gray-200 to-gray-300"
            style={{
              left: "20px",
              right: "20px",
            }}
          />

          {/* Progress line for first row */}
          <div
            className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out"
            style={{
              width: `calc((100% - 40px) * ${Math.min(currentIndex / 2, 1)})`,
            }}
          />

          {steps
            .slice(0, 3)
            .map((step, index) => renderStep(step, index, true))}
        </div>

        {/* Second row - remaining steps */}
        {steps.length > 3 && (
          <div className="flex items-center justify-around relative">
            {/* Background line for second row */}
            <div
              className="absolute top-5 h-0.5 bg-gradient-to-r from-gray-200 to-gray-300"
              style={{
                left: "20px",
                right: "20px",
              }}
            />

            {/* Progress line for second row */}
            <div
              className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out"
              style={{
                width: `calc((100% - 40px) * ${
                  currentIndex > 2
                    ? Math.min((currentIndex - 2) / (steps.length - 3), 1)
                    : 0
                })`,
              }}
            />

            {steps.slice(3).map((step, index) => {
              const actualIndex = index + 3;
              return renderStep(step, actualIndex, true);
            })}
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mt-6 md:mt-8 bg-gray-50 rounded-lg p-4">
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
