export type Severity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "reported" | "dispatched" | "resolved";

export interface Incident {
  id: string;
  title: string;
  category: "crowd" | "medical" | "facility" | "security" | "accessibility" | "sustainability";
  zone: string; // e.g. "Zone A - Gate 1", "Zone B - Concourse"
  location: string; // e.g. "Section 104, Row K"
  severity: Severity;
  status: IncidentStatus;
  description: string;
  reportedAt: string;
  assignedStaffId?: string;
  aiRecommendation?: string;
}

export interface TransportStatus {
  id: string;
  mode: "Metro" | "Shuttle Bus" | "Rideshare" | "Express Rail";
  line: string;
  destination: string;
  frequencyMinutes: number;
  waitTimeMinutes: number;
  status: "Normal" | "Delayed" | "Crowded" | "Suspended";
  alertText?: string;
}

export interface StadiumZone {
  id: string;
  name: string;
  capacity: number;
  currentCrowdCount: number;
  densityStatus: "Optimal" | "Moderate" | "Congested";
  gates: string[];
  features: {
    restrooms: boolean;
    concessions: string[];
    wheelchairAccess: boolean;
    firstAid: boolean;
  };
}

export interface VolunteerStaff {
  id: string;
  name: string;
  role: "Volunteer" | "Medical Team" | "Security Staff" | "Maintenance";
  currentZone: string;
  languages: string[];
  status: "Available" | "Dispatched" | "On Break";
  contact: string;
}

export interface ChatMessage {
  id: string;
  sender: "fan" | "staff" | "organizer" | "ai";
  senderName: string;
  text: string;
  timestamp: string;
  language?: string;
  translation?: string;
}

export interface OperationsStats {
  gateQueueTimes: Record<string, number>; // in minutes
  totalActiveFans: number;
  totalVolunteersOnDuty: number;
  sustainabilityScore: number; // 0-100 (waste recycle rate, energy saving)
  carbonSavedKg: number;
}
