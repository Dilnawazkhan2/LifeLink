export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

/** Cities offered in pickers/filters. The backend accepts any city name (normalised server-side). */
export const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Hyderabad', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'] as const;
export type City = string;

export type Availability = 'available' | 'resting' | 'busy';
export type AccountRole = 'donor' | 'recipient' | 'both';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  city: City;
  area: string;
  role: AccountRole;
  verified: boolean;
  availability: Availability;
  avatarUri?: string;
  /** Backend only: storage path of the avatar (avatars/<uid>/...) */
  avatarPath?: string;
  livesSaved: number;
  rating: number;
  age: number;
  weightKg: number;
  gender: 'Male' | 'Female';
  memberSince: string; // ISO date
  /** Backend only: admin/moderator roles */
  roles?: string[];
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  city: City;
  area: string;
  verified: boolean;
  availability: Availability;
  donations: number;
  rating: number;
  reviews: number;
  distanceKm: number;
  hours: string;
  phone: string;
  lastDonation: string; // ISO date
  age: number;
  gender: 'Male' | 'Female';
  about: string;
  memberSince: string;
}

export type Urgency = 'critical' | 'urgent' | 'normal';
/**
 * 'active' = published and open to donors (server status approved or active).
 * 'pending' (awaiting admin review), 'rejected' and 'cancelled' are only ever shown to the requester.
 */
export type RequestStatus = 'pending' | 'active' | 'fulfilled' | 'rejected' | 'cancelled';

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospitalName: string;
  hospitalId?: string;
  area: string;
  city: City;
  description: string;
  contactName: string;
  contactPhone: string;
  urgency: Urgency;
  status: RequestStatus;
  createdAt: string; // ISO date-time
  respondedCount: number;
  distanceKm: number;
  /** true when the logged-in user posted this request */
  isMine?: boolean;
  /** Backend only: tracking code (BR-YYYY-NNNNNN), raw workflow status and admin reason */
  referenceCode?: string;
  serverStatus?: 'pending' | 'approved' | 'active' | 'fulfilled' | 'rejected' | 'cancelled';
  statusReason?: string;
  source?: 'website' | 'android' | 'admin';
}

export type HospitalType = 'Private' | 'Public' | 'Semi-Government';

export interface Hospital {
  id: string;
  name: string;
  type: HospitalType;
  hasBloodBank: boolean;
  city: City;
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  distanceKm: number;
  open24h: boolean;
  verified: boolean;
  beds: number;
  about: string;
  services: string[];
  /** Units in stock per blood group */
  inventory: Record<BloodGroup, number>;
}

export type NotificationType = 'request' | 'accepted' | 'message' | 'donation' | 'badge' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** Optional deep link inside the app */
  link?: string;
}

export interface Donation {
  id: string;
  hospitalName: string;
  city: City;
  date: string; // ISO date
  units: number;
  bloodGroup: BloodGroup;
  requestId?: string;
  certificateNo: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: 'shield' | 'help' | 'droplet' | 'award' | 'heart' | 'zap' | 'star' | 'trophy';
  tone: 'blue' | 'green' | 'red' | 'amber' | 'purple';
  earnedAt?: string;
  /** progress 0..1 for locked badges */
  progress?: number;
  requirement: string;
}

export interface AppSettings {
  pushNotifications: boolean;
  emergencyAlerts: boolean;
  emailUpdates: boolean;
  smsAlerts: boolean;
  showInSearch: boolean;
  shareLocation: boolean;
  searchRadiusKm: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}
