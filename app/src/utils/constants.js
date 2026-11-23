// CareQueue - Design Tokens and Constants

export const COLORS = {
  primary: '#00796B',        // Hospital Teal
  primaryLight: '#E0F2F1',   // Soft Teal Background
  primaryDark: '#004D40',    // Dark Teal Header
  secondary: '#0288D1',      // Ocean Blue
  accent: '#FF6F00',         // Amber Warning / Urgency
  
  // Backgrounds & Surface
  background: '#F5F7FB',     // Clean App Canvas
  surface: '#FFFFFF',        // Card / Modal Surface
  surfaceMuted: '#F0F3F8',   // Input / Table Header
  border: '#E2E8F0',         // Divider / Border
  
  // Typography
  textPrimary: '#1E293B',    // Slate 900
  textSecondary: '#64748B',  // Slate 500
  textMuted: '#94A3B8',      // Slate 400
  textInverse: '#FFFFFF',
  
  // System States
  success: '#10B981',        // Emerald Green
  successLight: '#D1FAE5',
  warning: '#F59E0B',        // Amber
  warningLight: '#FEF3C7',
  danger: '#EF4444',         // Red
  dangerLight: '#FEE2E2',
  info: '#3B82F6',           // Blue
  infoLight: '#DBEAFE',
};

// Status Colors for Tokens, Admissions, and Beds
export const STATUS_COLORS = {
  // Token Statuses
  waiting: { bg: '#FEF3C7', text: '#D97706', label: 'Waiting' },
  called: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Called' },
  in_consultation: { bg: '#E0F2F1', text: '#00796B', label: 'In Consultation' },
  completed: { bg: '#D1FAE5', text: '#059669', label: 'Completed' },
  skipped: { bg: '#FEE2E2', text: '#DC2626', label: 'Skipped' },
  cancelled: { bg: '#F1F5F9', text: '#64748B', label: 'Cancelled' },

  // Admission Statuses
  pending: { bg: '#FEF3C7', text: '#D97706', label: 'Pending Review' },
  approved: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Approved' },
  admitted: { bg: '#D1FAE5', text: '#059669', label: 'Admitted' },
  discharged: { bg: '#E2E8F0', text: '#475569', label: 'Discharged' },
  rejected: { bg: '#FEE2E2', text: '#DC2626', label: 'Rejected' },

  // Bed Statuses
  free: { bg: '#D1FAE5', text: '#059669', label: 'Available' },
  occupied: { bg: '#FEE2E2', text: '#DC2626', label: 'Occupied' },
  maintenance: { bg: '#FEF3C7', text: '#D97706', label: 'Cleaning / Maint.' },

  // Urgency Levels
  normal: { bg: '#E2E8F0', text: '#475569', label: 'Normal' },
  urgent: { bg: '#FEF3C7', text: '#D97706', label: 'Urgent' },
  critical: { bg: '#FEE2E2', text: '#DC2626', label: 'Critical' },
};

// Bed Types
export const BED_TYPES = [
  { key: 'general', label: 'General Ward', icon: '🛏️' },
  { key: 'icu', label: 'ICU', icon: '🫀' },
  { key: 'oxygen', label: 'Oxygen Supported', icon: '🫧' },
  { key: 'ventilator', label: 'Ventilator', icon: '🫁' },
  { key: 'pediatric', label: 'Pediatric Ward', icon: '👶' },
];

// Common Departments
export const DEFAULT_DEPARTMENTS = [
  { code: 'GM', name: 'General Medicine', avgConsultMins: 8 },
  { code: 'PED', name: 'Pediatrics', avgConsultMins: 10 },
  { code: 'ORTHO', name: 'Orthopedics', avgConsultMins: 12 },
  { code: 'ENT', name: 'ENT (Ear, Nose, Throat)', avgConsultMins: 8 },
  { code: 'GYN', name: 'Gynecology & Obstetrics', avgConsultMins: 10 },
  { code: 'CARD', name: 'Cardiology', avgConsultMins: 15 },
  { code: 'DERM', name: 'Dermatology', avgConsultMins: 8 },
  { code: 'EMER', name: 'Emergency Triage', avgConsultMins: 5 },
];

export default {
  COLORS,
  STATUS_COLORS,
  BED_TYPES,
  DEFAULT_DEPARTMENTS,
};
