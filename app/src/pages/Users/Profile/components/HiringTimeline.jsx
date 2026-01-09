import React from "react";
import { Briefcase, Clock, CheckCircle, XCircle, User as UserIcon, GraduationCap } from "lucide-react";
import { getStepState } from "../utils/profileHelpers";

const HIRING_STEPS = [
  { id: 1, name: "Under Review", icon: Clock },
  { id: 2, name: "Interview HC", icon: UserIcon },
  { id: 3, name: "Psikotes", icon: Clock },
  { id: 4, name: "Final Interview", icon: Briefcase },
  { id: 5, name: "Offering/Final Result", icon: GraduationCap },
];

const HiringTimeline = ({ currentStep, finalStatus, finalStatusClass, statusText }) => {
  return (
    <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Tahapan Seleksi</h3>

        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${finalStatusClass}`}>
          {finalStatus === "Accepted" && <CheckCircle size={16} className="mr-2" />}
          {finalStatus === "Rejected" && <XCircle size={16} className="mr-2" />}
          {finalStatus === "Pending" && <Clock size={16} className="mr-2" />}
          {statusText}
        </span>
      </div>

      <div className="flex items-start overflow-x-auto pb-2">
        {HIRING_STEPS.map((step, index) => {
          const state = getStepState(step.name, currentStep, finalStatus, HIRING_STEPS);
          const NodeIcon = step.icon;

          let nodeColor;
          let iconColor;
          let IconComponent = NodeIcon;

          if (state === "accepted" || state === "completed") {
            nodeColor = "bg-green-500";
            iconColor = "text-white";
          } else if (state === "rejected") {
            nodeColor = "bg-red-500";
            iconColor = "text-white";
            IconComponent = XCircle;
          } else if (state === "active") {
            nodeColor = "bg-white border-2 border-sky-500";
            iconColor = "text-sky-500";
          } else {
            nodeColor = "bg-gray-200";
            iconColor = "text-gray-500";
          }

          const prevStepState =
            index > 0
              ? getStepState(HIRING_STEPS[index - 1].name, currentStep, finalStatus, HIRING_STEPS)
              : null;

          const lineColor =
            prevStepState === "completed" || prevStepState === "accepted"
              ? "bg-green-500"
              : prevStepState === "rejected"
              ? "bg-red-500"
              : "bg-gray-300";

          const lineRightColor =
            state === "completed" || state === "active" || state === "accepted"
              ? "bg-green-500"
              : state === "rejected"
              ? "bg-red-500"
              : "bg-gray-300";

          const textColor =
            state === "active"
              ? "text-blue-600 font-semibold"
              : state === "completed" || state === "accepted"
              ? "text-gray-900"
              : state === "rejected"
              ? "text-red-600 line-through"
              : "text-gray-500";

          return (
            <div key={step.id} className="flex flex-col items-center min-w-[120px] text-center flex-1">
              <div className="flex items-center w-full">
                {index !== 0 ? (
                  <div className={`flex-1 h-1 transition duration-500 ${lineColor}`} />
                ) : (
                  <div className="w-1/2 h-1 bg-transparent" />
                )}

                <div className={`w-6 h-6 rounded-full transition duration-500 flex items-center justify-center ${nodeColor}`}>
                  <IconComponent size={14} className={iconColor} />
                </div>

                {index !== HIRING_STEPS.length - 1 ? (
                  <div className={`flex-1 h-1 transition duration-500 ${lineRightColor}`} />
                ) : (
                  <div className="w-1/2 h-1 bg-transparent" />
                )}
              </div>

              <p className={`mt-2 text-sm ${textColor} transition duration-500`}>{step.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HiringTimeline;
