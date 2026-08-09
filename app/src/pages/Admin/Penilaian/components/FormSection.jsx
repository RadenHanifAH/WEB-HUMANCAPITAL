import React from "react";

const FormSection = ({ title, children }) => {
  return (
    <div className="mb-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      )}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
