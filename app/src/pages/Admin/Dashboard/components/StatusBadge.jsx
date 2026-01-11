import React from "react";
import { getStatusClasses } from "../utils/helpers";

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 text-xs rounded ${getStatusClasses(status)}`}>
    {status}
  </span>
);

export default StatusBadge;
