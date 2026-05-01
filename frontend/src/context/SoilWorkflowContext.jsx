import React, { createContext, useContext, useMemo, useState } from 'react';
import { soilReports } from '../data/soilReports';

const SoilWorkflowContext = createContext();

const getNextRandomIndex = (lastIndex, length) => {
  if (length <= 1) {
    return 0;
  }

  let candidate = Math.floor(Math.random() * length);
  while (candidate === lastIndex) {
    candidate = Math.floor(Math.random() * length);
  }
  return candidate;
};

export const SoilWorkflowProvider = ({ children }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [lastIndex, setLastIndex] = useState(-1);
  const [requestDetails, setRequestDetails] = useState({
    sampleId: '',
    farmerName: '',
    village: '',
  });

  const refreshReport = () => {
    const reportIndex = getNextRandomIndex(lastIndex, soilReports.length);
    setLastIndex(reportIndex);
    setSelectedReport(soilReports[reportIndex]);
  };

  const updateRequestDetails = (updates) => {
    setRequestDetails((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const setWorkflowReport = (report) => {
    setSelectedReport(report);
  };

  const value = useMemo(
    () => ({
      selectedReport,
      requestDetails,
      refreshReport,
      setWorkflowReport,
      updateRequestDetails,
    }),
    [selectedReport, requestDetails]
  );

  return <SoilWorkflowContext.Provider value={value}>{children}</SoilWorkflowContext.Provider>;
};

export const useSoilWorkflow = () => useContext(SoilWorkflowContext);
