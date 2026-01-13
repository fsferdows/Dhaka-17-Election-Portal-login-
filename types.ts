
export enum UserRole {
  VOTER = 'VOTER',
  CANDIDATE = 'CANDIDATE',
  ADMIN = 'ADMIN'
}

export interface Candidate {
  id: string;
  userId?: string; 
  name: string;
  phone?: string;
  email?: string;
  party: string;
  symbol: string;
  manifesto: string;
  manifestoDetails: {
    infrastructure: string;
    education: string;
    healthcare: string;
    digitalization: string;
  };
  focusIssues: string[];
  imageUrl: string;
  isApproved: boolean;
  events: Event[];
  stats: {
    followers: number;
    rsvps: number;
    positiveSentiment: number;
    budgetTransparency: number;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  candidateId: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  isUrgent: boolean;
}

export interface VotingCenter {
  id: string;
  name: string;
  location: string;
  capacity: string;
  status: 'Normal' | 'Busy' | 'Crowded';
  ward: string;
}

export interface User {
  id: string;
  name: string;
  address: string;
  phone: string;
  role: UserRole;
  followedCandidates: string[];
  notifications: Notification[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface IncidentReport {
  id: string;
  voterId: string;
  type: string;
  location: string;
  description: string;
  timestamp: string;
  status: 'Reported' | 'Under Review' | 'Resolved';
}

export type ViewState = 'AUTH' | 'VOTER_DASHBOARD' | 'CANDIDATE_DASHBOARD' | 'ADMIN_DASHBOARD' | 'PROFILE_VIEW' | 'CENTER_FINDER' | 'VOTING_GUIDE' | 'INCIDENT_REPORT' | 'CODE_OF_CONDUCT' | 'PRIVACY_POLICY';
