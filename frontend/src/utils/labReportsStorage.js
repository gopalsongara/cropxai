import { DUMMY_LAB_REPORTS } from '../data/dummyLabReports';

const STORAGE_KEY = 'cropai_lab_reports_state_v1';

function cloneReports() {
  return JSON.parse(JSON.stringify(DUMMY_LAB_REPORTS));
}

export function loadLabReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneReports();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneReports();
    return parsed;
  } catch {
    return cloneReports();
  }
}

export function persistLabReports(reports) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {
    /* quota / private mode */
  }
}

export function resetLabReportsDemo() {
  localStorage.removeItem(STORAGE_KEY);
}
