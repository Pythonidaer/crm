import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const leads = pgTable('leads', {
  id: text('id').primaryKey(),
  seedKey: text('seed_key').notNull().unique(),

  companyName: text('company_name').notNull(),
  displayName: text('display_name').notNull().default(''),
  address: text('address').notNull().default(''),
  city: text('city').notNull(),
  state: text('state').notNull().default('MA'),
  sector: text('sector').notNull().default(''),
  phoneNumber: text('phone_number'),
  internationalPhoneNumber: text('international_phone_number'),
  website: text('website'),
  email: text('email'),
  sourceUrl: text('source_url').notNull().default(''),
  dataSource: text('data_source').notNull().default('manual'),

  googlePlaceId: text('google_place_id'),
  googleDisplayName: text('google_display_name'),
  googleFormattedAddress: text('google_formatted_address'),
  googleMapsUri: text('google_maps_uri'),
  businessStatus: text('business_status'),
  matchConfidence: text('match_confidence'),
  matchScore: integer('match_score'),
  enrichmentStatus: text('enrichment_status'),
  enrichmentNotes: text('enrichment_notes'),
  lastEnrichedAt: timestamp('last_enriched_at', { withTimezone: true, mode: 'string' }),
  emailsFound: jsonb('emails_found').$type<string[]>().notNull().default([]),
  emailSourceUrl: text('email_source_url'),
  emailEnrichmentStatus: text('email_enrichment_status'),
  emailEnrichmentNotes: text('email_enrichment_notes'),
  emailEnrichedAt: timestamp('email_enriched_at', { withTimezone: true, mode: 'string' }),

  status: text('status').notNull().default('not_contacted'),
  priority: text('priority').notNull().default('medium'),
  nextFollowUpAt: timestamp('next_follow_up_at', { withTimezone: true, mode: 'string' }),
  lastContactedAt: timestamp('last_contacted_at', { withTimezone: true, mode: 'string' }),
  contactName: text('contact_name').notNull().default(''),
  contactRole: text('contact_role').notNull().default(''),
  contactEmail: text('contact_email').notNull().default(''),
  notes: text('notes').notNull().default(''),

  hasWebsite: boolean('has_website').notNull().default(false),
  websiteNeedsWork: boolean('website_needs_work').notNull().default(false),
  accessibilityOpportunity: boolean('accessibility_opportunity').notNull().default(false),
  seoOpportunity: boolean('seo_opportunity').notNull().default(false),
  aeoOpportunity: boolean('aeo_opportunity').notNull().default(false),
  decisionMakerFound: boolean('decision_maker_found').notNull().default(false),

  leadFitScore: integer('lead_fit_score').notNull().default(0),
  leadFitTier: text('lead_fit_tier').notNull().default('medium'),
  disqualificationReason: text('disqualification_reason'),

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull(),
})

export type LeadRow = typeof leads.$inferSelect
export type NewLeadRow = typeof leads.$inferInsert
