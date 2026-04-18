import { Timestamp } from "firebase/firestore";

export type ZenthiumReferralStatus =
  | "Submitted"
  | "Under Review"
  | "Screening Complete"
  | "Follow-Up Requested"
  | "Meeting Scheduled"
  | "Accepted"
  | "Declined"
  | "Closed";

export type ZenthiumUserRole = "user" | "admin" | "reviewer";

export interface ZenthiumAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ZenthiumContact {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface ZenthiumReferral {
  id: string;
  userId: string;
  title: string;
  propertyName: string;
  address: ZenthiumAddress;
  coordinates?: string;
  parcelNumber?: string;
  acreage?: number;
  squareFootage?: number;
  powerCapacityMW?: number;
  utilities?: string;
  fiberAvailability?: string;
  waterAvailability?: string;
  zoning?: string;
  ownership?: string;
  pricing?: string;
  description: string;
  environmentalNotes?: string;
  timeline?: string;
  poc: ZenthiumContact;
  directContact: ZenthiumContact;
  status: ZenthiumReferralStatus;
  adminNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ZenthiumReferralInput
  extends Omit<ZenthiumReferral, "id" | "createdAt" | "updatedAt"> {}

export interface ZenthiumStatusHistoryEntry {
  id: string;
  referralId: string;
  previousStatus: ZenthiumReferralStatus | null;
  newStatus: ZenthiumReferralStatus;
  changedBy: string;
  note?: string;
  createdAt: Timestamp;
}

export interface ZenthiumMeeting {
  id: string;
  referralId: string;
  title: string;
  date: string;
  time: string;
  agenda?: string;
  zoomMeetingId?: string;
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface ZenthiumNotification {
  id: string;
  userId: string;
  referralId: string;
  type: "new_referral" | "status_change" | "meeting_scheduled";
  message: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface ZenthiumUser {
  id: string;
  email: string;
  displayName: string;
  role: ZenthiumUserRole;
  createdAt: Timestamp;
}

export interface ZenthiumDirectContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  active: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
