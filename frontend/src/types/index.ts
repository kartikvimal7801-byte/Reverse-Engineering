// Type definitions for the application

export type ProjectType = 'reverse_engineering' | 'va_ve';

export type ProjectStatus = 'in_progress' | 'approved' | 'rejected';

export interface Project {
  id: string;
  type: ProjectType;
  name: string;
  notes?: string;
  status: ProjectStatus;
  currentStep: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  completionPercentage: number;
}

export interface WorkflowStepData {
  stepNumber: number;
  status: 'incomplete' | 'complete';
  data: any; // Step-specific data stored as JSON
  completedAt?: string; // ISO 8601
}

export interface ProjectWorkflow {
  projectId: string;
  steps: Record<number, WorkflowStepData>;
}

// Step 1 - Benchmark Product Selection
export interface Step1Data {
  productName: string;
  modelNumber: string;
  manufacturer: string;
  category: string;
  supplierInfo?: {
    supplierName?: string;
    contactInfo?: string;
    unitPrice?: number;
  };
  marketData?: {
    priceRange?: string;
    availability?: string;
    competitors?: string[];
  };
  images?: string[]; // Base64 or file references
}

// Step 2 - Product Teardown Documentation
export interface Component {
  id: string;
  partId: string;
  photos: string[]; // Base64 or file references
  assemblyPosition?: number;
}

export interface Step2Data {
  components: Component[];
  assemblySequence: {
    stepNumber: number;
    description: string;
  }[];
}

// Step 3 - 3D Scanning and Measurement Capture
export interface Measurement {
  id: string;
  componentId: string;
  measurementType?: string;
  value: number; // millimeters
  unit: string;
  cadFileUrl?: string;
  geometryData?: {
    shapeType?: string;
    tolerances?: string;
  };
}

export interface Step3Data {
  measurements: Measurement[];
}

// Step 4 - Material Identification
export interface Material {
  id: string;
  componentId: string;
  materialType: 'casting' | 'shaft' | 'impeller' | 'fastener' | 'other';
  materialName: string;
}

export interface Step4Data {
  materials: Material[];
}

// Step 5 - Performance Benchmarking
export interface Step5Data {
  head: number; // meters
  discharge: number; // LPM
  efficiency: number; // percentage
  powerConsumption: number; // watts
}

// Step 6 - Cost Breakdown Analysis
export interface CostData {
  componentId: string;
  bomCost: number;
}

export interface Step6Data {
  componentCosts: CostData[];
  manufacturingCost: number;
  assemblyCost: number;
  logisticsCost: number;
  totalCost: number;
}

// Step 7 - AI Design Evaluation
export interface Step7Data {
  improvementOpportunities: string[];
  costReductions: { description: string; estimatedSavings: number }[];
  reliabilityImprovements: { component: string; suggestion: string }[];
  manufacturabilityImprovements: string[];
  analysisStatus: 'pending' | 'completed' | 'failed';
}

// Step 8 - Value Engineering Suggestions
export interface ValueEngineeringSuggestion {
  current: string;
  alternative: string;
  costDifference: number;
  performanceMetrics: Record<string, any>;
}

export interface Step8Data {
  materialAlternatives: ValueEngineeringSuggestion[];
  designAlternatives: ValueEngineeringSuggestion[];
  processImprovements: ValueEngineeringSuggestion[];
  analysisStatus: 'pending' | 'completed' | 'failed';
}

// Step 9 - New Product Concept Generation
export interface Step9Data {
  selectedImprovements: string[];
  designDescription: string;
  proposedSpecifications: Record<string, any>;
  featureImprovements: string[];
  conceptStatus: 'pending' | 'completed' | 'failed';
}

// Step 10 - Management Review
export interface Step10Data {
  decision: 'approved' | 'rework_required' | 'rejected' | 'pending';
  feedback?: string;
  reviewedAt?: string; // ISO 8601
  reviewerId?: string;
}

// Step 11 - Final Report
export interface Step11Data {
  reportGenerated: boolean;
  reportUrl?: string;
  generatedAt?: string; // ISO 8601
}

export type StepData =
  | Step1Data
  | Step2Data
  | Step3Data
  | Step4Data
  | Step5Data
  | Step6Data
  | Step7Data
  | Step8Data
  | Step9Data
  | Step10Data
  | Step11Data;
