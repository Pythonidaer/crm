export type LeadStatus =
  | 'not_contacted'
  | 'called'
  | 'interested'
  | 'follow_up'
  | 'proposal_sent'
  | 'won'
  | 'lost'

export type LeadPriority = 'low' | 'medium' | 'high'

export interface LeadQualification {
  hasWebsite: boolean
  websiteNeedsWork: boolean
  accessibilityOpportunity: boolean
  seoOpportunity: boolean
  aeoOpportunity: boolean
  decisionMakerFound: boolean
}

export interface Lead {
  id: string
  companyName: string
  address: string
  city: string
  state: string
  sector: string
  selector: string
  phone: string
  website: string
  status: LeadStatus
  priority: LeadPriority
  contactName: string
  contactRole: string
  contactEmail: string
  lastContactedAt: string
  nextFollowUpAt: string
  notes: string
  qualification: LeadQualification
  sourceUrl: string
  createdAt: string
  updatedAt: string
}

export type LeadSortKey =
  | 'companyName'
  | 'city'
  | 'sector'
  | 'status'
  | 'nextFollowUpAt'
  | 'lastContactedAt'

export interface LeadFilters {
  search: string
  city: string
  sector: string
  selector: string
  status: string
  priority: string
}
