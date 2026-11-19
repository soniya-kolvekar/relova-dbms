// =============================================================================
// RELOVA DBMS — 8 CORE POSTGRESQL DATABASE ENTITIES
// =============================================================================

export type ConditionGrade = "A" | "B" | "C" | "D";
export type LotStatus = "available" | "reserved" | "exchanged";
export type DemandStatus = "open" | "matched" | "fulfilled";
export type MatchStatus = "suggested" | "accepted" | "rejected";
export type ExchangeStatus =
  | "submitted"
  | "accepted"
  | "logistics_scheduled"
  | "completed";

// Table 1: users
export interface User {
  id: string;
  email: string;
  full_name: string;
  organization: string;
  role: string; // 'dual' standard unified operator
  location: string;
  phone?: string;
  created_at: string;
}

// Table 2: material_categories
export interface MaterialCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  unit_default: string;
  co2e_factor: number;
  water_factor: number;
}

// Table 3: resource_lots (No images - uses clean non-AI material icons)
export interface ResourceLot {
  id: string;
  lot_code: string;
  user_id?: string;
  provider_name: string;
  organization: string;
  category_id: string;
  category_name: string;
  title: string;
  description: string;
  material_type: string;
  grade: ConditionGrade;
  quantity: number;
  unit: string;
  price_per_unit: number; // 0 = free donation
  storage_bay: string;
  status: LotStatus;
  created_at: string;
}

// Table 4: demand_requests
export interface DemandRequest {
  id: string;
  request_code: string;
  user_id?: string;
  recipient_name: string;
  organization: string;
  category_id: string;
  category_name: string;
  title: string;
  material_type: string;
  quantity_needed: number;
  unit: string;
  min_condition: ConditionGrade;
  urgency: "Low" | "Medium" | "High" | "Immediate";
  intended_purpose: string;
  status: DemandStatus;
  created_at: string;
}

// Table 5: matches
export interface Match {
  id: string;
  lot_id: string;
  request_id: string;
  lot_title: string;
  request_title: string;
  provider_name: string;
  recipient_name: string;
  provider_org: string;
  recipient_org: string;
  match_score: number;
  category_fit?: number;
  quantity_fit?: number;
  condition_fit?: number;
  proximity_fit?: number;
  status: MatchStatus;
  created_at: string;
}

// Table 6: exchanges
export interface Exchange {
  id: string;
  exchange_code: string;
  match_id?: string;
  lot_id: string;
  request_id?: string;
  material_name: string;
  agreed_quantity: number;
  unit: string;
  provider_name: string;
  provider_org: string;
  recipient_name: string;
  recipient_org: string;
  scheduled_pickup: string;
  pickup_location: string;
  status: ExchangeStatus;
  verification_code: string;
  measured_quantity_kg?: number;
  scale_id?: string;
  created_at: string;
  completed_at?: string;
}

// Table 7: exchange_events
export interface ExchangeEvent {
  id: string;
  exchange_id: string;
  event_type: string;
  title: string;
  description: string;
  actor_name: string;
  created_at: string;
}

// Table 8: impact_records
export interface ImpactRecord {
  id: string;
  exchange_id: string;
  material_type: string;
  diverted_kg: number;
  co2e_saved_kg: number;
  water_saved_litres: number;
  calculated_at: string;
}

// Dynamic Environmental Impact
export interface EnvironmentalStats {
  total_diverted_kg: number;
  total_co2e_saved_kg: number;
  total_water_saved_litres: number;
  completed_exchanges_count: number;
}
