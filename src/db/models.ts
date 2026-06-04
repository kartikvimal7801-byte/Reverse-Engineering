// Database model type definitions

export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: 'user' | 'manager';
  created_at: Date;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  notes?: string;
  status: 'in_progress' | 'approved' | 'rejected';
  current_step: number;
  created_at: Date;
  updated_at: Date;
}

export interface WorkflowStep {
  id: number;
  project_id: number;
  step_number: number;
  status: 'incomplete' | 'complete';
  data?: any; // JSONB field
  completed_at?: Date;
}

export interface Component {
  id: number;
  project_id: number;
  part_id: string;
  photo_urls?: string[];
  assembly_position?: number;
  created_at: Date;
}

export interface Measurement {
  id: number;
  component_id: number;
  measurement_type?: string;
  value?: number;
  unit: string;
  cad_file_url?: string;
  geometry_data?: any; // JSONB field
}

export interface Material {
  id: number;
  component_id: number;
  material_type?: string;
  material_name?: string;
}

export interface PerformanceData {
  id: number;
  project_id: number;
  head?: number;
  discharge?: number;
  efficiency?: number;
  power_consumption?: number;
}

export interface CostData {
  id: number;
  project_id: number;
  component_id?: number;
  bom_cost?: number;
  manufacturing_cost?: number;
  assembly_cost?: number;
  logistics_cost?: number;
  total_cost?: number;
}

export interface AIAnalysis {
  id: number;
  project_id: number;
  step_number: number;
  analysis_type?: string;
  input_data?: any; // JSONB field
  output_data?: any; // JSONB field
  status: 'pending' | 'completed' | 'failed';
  executed_at: Date;
}

export interface ManagementReview {
  id: number;
  project_id: number;
  decision: 'approved' | 'rework_required' | 'rejected';
  feedback?: string;
  reviewer_id?: number;
  reviewed_at: Date;
}

export interface Report {
  id: number;
  project_id: number;
  pdf_url: string;
  generated_at: Date;
}

export interface File {
  id: number;
  project_id: number;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  s3_url: string;
  uploaded_at: Date;
}
