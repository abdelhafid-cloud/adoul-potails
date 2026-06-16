export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  cin?: string;
  profile_image_url?: string;
  role: string;
  cabinet_id?: string;
  city?: string;
  city_code?: string;
  is_verified: boolean;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  cin: string;
  phone?: string;
  email?: string;
  address?: string;
  profession?: string;
  notes?: string;
  created_at?: string;
}

export interface Dossier {
  id: string;
  number: string;
  title?: string;
  type: string;
  status: string;
  description?: string;
  client_id: string;
  client_name?: string;
  responsible_id?: string;
  responsible_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  dossiers_count: number;
  clients_count: number;
  calculations_count: number;
  documents_count: number;
  pending_dossiers_count?: number;
  recent_dossiers?: Array<{
    id: string;
    number: string;
    title?: string;
    type: string;
    status: string;
    client_name?: string;
    updated_at?: string;
  }>;
  recent_activity: Array<{
    action: string;
    entity_type?: string;
    entity_id?: string;
    created_at: string;
    user_name?: string;
    context_fr?: string;
    context_ar?: string;
    link?: string;
  }>;
  dossiers_by_type: Record<string, number>;
}

export interface AdminStats {
  cabinets_count: number;
  users_count: number;
  adouls_count: number;
  clients_count: number;
  dossiers_count: number;
  calculations_count: number;
  ai_conversations_count: number;
  activity_today: number;
}

export interface AdminCabinet {
  id: string;
  name: string;
  owner_name?: string;
  email: string;
  city: string;
  phone?: string;
  is_active: boolean;
  users_count: number;
  clients_count: number;
  dossiers_count: number;
  last_activity_at?: string;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_image_url?: string | null;
  role: string;
  cabinet_id?: string;
  cabinet_name?: string;
  cabinet_city?: string;
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  created_at?: string;
}

export interface AdminAdoul extends AdminUser {
  dossiers_count: number;
  last_activity_at?: string;
}

export interface AdminActivityItem {
  action: string;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  cabinet_id?: string;
  cabinet_name?: string;
  cabinet_city?: string;
  context_fr?: string;
  context_ar?: string;
  link?: string;
}

export interface FaraidAdjustment {
  type: "awl" | "radd";
  title_fr: string;
  title_ar?: string;
  detail_fr: string;
  detail_ar?: string;
}

export interface DeceasedInfo {
  name_fr?: string | null;
  name_ar?: string | null;
  cin?: string | null;
  death_date?: string | null;
  death_place?: string | null;
  gender?: string | null;
}

export interface InheritanceCalculationSummary {
  id: string;
  title: string;
  net_estate_value: number;
  total_estate_value?: number;
  heirs_count?: number;
  excluded_count?: number;
  deceased_name?: string;
  deceased_name_ar?: string;
  has_awl?: boolean;
  has_radd?: boolean;
  dossier_id?: string;
  dossier_number?: string;
  dossier_title?: string;
  client_name?: string;
  created_at?: string;
}

export interface WasiyyahResult {
  gross_net_estate?: number;
  net_estate_value?: number;
  max_wasiyyah?: number;
  wasiyyah_amount_requested?: number;
  wasiyyah_amount_applied?: number;
  remainder_for_heirs?: number;
  legatee_name?: string;
  legatee_name_ar?: string;
  legatee_is_heir?: boolean;
  heirs_consent?: boolean;
  wasiyyah_kind?: string;
  is_valid?: boolean;
  exceeds_max?: boolean;
  status_fr?: string;
  status_ar?: string;
  lines?: { label_fr: string; label_ar: string; amount: number }[];
}

export interface InheritanceCalculation {
  id: string;
  title: string;
  deceased_info?: DeceasedInfo;
  total_estate_value: number;
  real_estate_value: number;
  bank_accounts_value: number;
  debts: number;
  fees: number;
  net_estate_value: number;
  faraid_base?: number;
  wasiyyah?: WasiyyahResult | null;
  heirs: HeirInput[];
  distribution: DistributionItem[];
  heir_details?: HeirDetail[];
  excluded_heirs?: HeirDetail[];
  adjustments?: FaraidAdjustment[];
  calculation_meta?: {
    total_shares_pct?: number;
    has_awl?: boolean;
    has_radd?: boolean;
  };
  legal_proof?: LegalProof;
  legal_verification?: LegalVerificationEntry[];
  dossier_id?: string;
  dossier?: DossierSummary;
  client?: ClientSummary;
  notes?: string;
  created_at?: string;
}

export interface DossierSummary {
  id: string;
  number: string;
  title?: string;
  type: string;
  status: string;
}

export interface ClientSummary {
  id: string;
  full_name: string;
  cin?: string;
}

export interface LegalVerificationEntry {
  type: string;
  name?: string;
  name_ar?: string;
  status: "inherits" | "blocked" | "pending";
  status_label_fr?: string;
  status_label_ar?: string;
  rule_applied_fr?: string;
  rule_applied_ar?: string;
  justification_fr?: string;
  justification_ar?: string;
  legal_reference_fr?: string;
  legal_reference_ar?: string;
  blocking_heir_fr?: string;
  blocking_heir_ar?: string;
  share_applied?: string;
  amount?: number;
  percentage?: number;
  note_fr?: string;
  note_ar?: string;
}

export interface LegalProof {
  summary?: LegalSummary;
  steps?: LegalStep[];
  legal_verification?: LegalVerificationEntry[];
  heir_proofs?: HeirProof[];
  excluded_heirs?: Array<{
    type?: string;
    name?: string;
    name_ar?: string;
    status?: string;
    reason_fr?: string;
    reason_ar?: string;
  }>;
  adjustments?: FaraidAdjustment[];
  calculation_meta?: {
    has_awl?: boolean;
    has_radd?: boolean;
  };
  report?: {
    deceased_fr?: string;
    deceased_ar?: string;
    deceased?: DeceasedInfo;
    net_estate?: number;
    faraid_base?: number;
    has_wasiyyah?: boolean;
    wasiyyah_applied?: number;
    heirs_count?: number;
    excluded_count?: number;
    has_awl?: boolean;
    has_radd?: boolean;
    school_fr?: string;
    school_ar?: string;
  };
  wasiyyah?: WasiyyahResult;
  faraid_base?: number;
  net_estate_before_wasiyyah?: number;
  deceased?: DeceasedInfo;
}

export interface DossierDocument {
  id: string;
  name: string;
  file_type?: string;
  file_size?: number;
  file_url?: string;
  created_at?: string;
}

export interface LegalSummary {
  school_fr?: string;
  school_ar?: string;
  law_fr?: string;
  law_ar?: string;
  ministry_fr?: string;
  ministry_ar?: string;
  disclaimer_fr?: string;
  disclaimer_ar?: string;
}

export interface LegalStep {
  step: string;
  title_fr: string;
  title_ar?: string;
  detail_fr: string;
  detail_ar?: string;
}

export interface HeirProof {
  type?: string;
  name?: string;
  name_ar?: string;
  amount?: number;
  percentage?: number;
  status?: "inherits" | "blocked" | "pending";
  reason_fr?: string | null;
  reason_ar?: string | null;
  legal_basis?: LegalBasis;
}

export interface LegalBasis {
  category_fr?: string;
  category_ar?: string;
  share_fr?: string;
  share_ar?: string;
  quran_fr?: string;
  quran_ar?: string;
  maliki_fr?: string;
  maliki_ar?: string;
  moudawana_fr?: string;
  moudawana_ar?: string;
  applied_share?: string;
}

export interface DossierDetail extends Dossier {
  inheritance_calculations?: DossierCalculationItem[];
  property_shares?: DossierCalculationItem[];
  act_calculations?: DossierCalculationItem[];
  calculations?: DossierCalculationItem[];
  calculations_count?: number;
  documents?: DossierDocument[];
  documents_count?: number;
}

export interface DossierCalculationItem {
  id: string;
  type: string;
  title: string;
  total_amount: number;
  created_at?: string;
}

export interface ActCalculation {
  id: string;
  type: string;
  title: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown> & {
    lines?: Array<{ label_fr: string; label_ar: string; amount: number }>;
    total_fees?: number;
  };
  legal_proof?: LegalProof;
  total_amount: number;
  dossier_id?: string;
  dossier?: DossierSummary;
  client?: ClientSummary;
  notes?: string;
  created_at?: string;
}

export interface HeirPerson {
  name?: string;
  name_ar?: string;
  gender?: "male" | "female";
}

export interface HeirInput {
  type: string;
  name?: string;
  name_ar?: string;
  gender?: "male" | "female";
  count?: number;
  persons?: HeirPerson[];
  custom_share?: number;
}

export interface DistributionItem {
  type: string;
  name: string;
  count: number;
  share_fraction: number;
  total_share_fraction: number;
  amount: number;
  percentage: number;
  status?: string;
}

export interface HeirDetail {
  type: string;
  name: string;
  name_ar?: string;
  gender?: "male" | "female";
  gender_fr?: string;
  gender_ar?: string;
  index?: number;
  count_total?: number;
  amount: number;
  percentage: number;
  status: "inherits" | "blocked" | "pending";
  reason_fr?: string | null;
  reason_ar?: string | null;
  legal_basis?: LegalBasis;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
