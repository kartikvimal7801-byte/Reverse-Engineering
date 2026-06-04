// LocalStorage service for managing project data

import type { Project, ProjectWorkflow, WorkflowStepData } from '../types';

const PROJECTS_KEY = 'pump_projects';
const WORKFLOWS_KEY = 'pump_workflows';

// Helper to safely parse JSON from localStorage
function safeJSONParse<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return defaultValue;
  }
}

// Helper to safely stringify and save to localStorage
function safeJSONStringify(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// ===== PROJECT CRUD OPERATIONS =====

export function getAllProjects(): Project[] {
  return safeJSONParse<Project[]>(PROJECTS_KEY, []);
}

export function getProjectById(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find((p) => p.id === id) || null;
}

export function createProject(
  projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'completionPercentage'>
): Project {
  const projects = getAllProjects();
  const now = new Date().toISOString();

  const newProject: Project = {
    ...projectData,
    id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    completionPercentage: 0,
  };

  projects.push(newProject);
  safeJSONStringify(PROJECTS_KEY, projects);

  // Initialize empty workflow for this project
  initializeWorkflow(newProject.id);

  return newProject;
}

export function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt'>>
): Project | null {
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) return null;

  const updatedProject: Project = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updatedProject;
  safeJSONStringify(PROJECTS_KEY, projects);

  return updatedProject;
}

export function deleteProject(id: string): boolean {
  const projects = getAllProjects();
  const filtered = projects.filter((p) => p.id !== id);

  if (filtered.length === projects.length) return false;

  safeJSONStringify(PROJECTS_KEY, filtered);
  deleteWorkflow(id);

  return true;
}

// ===== WORKFLOW OPERATIONS =====

function getAllWorkflows(): Record<string, ProjectWorkflow> {
  return safeJSONParse<Record<string, ProjectWorkflow>>(WORKFLOWS_KEY, {});
}

function saveAllWorkflows(workflows: Record<string, ProjectWorkflow>): void {
  safeJSONStringify(WORKFLOWS_KEY, workflows);
}

function initializeWorkflow(projectId: string): void {
  const workflows = getAllWorkflows();

  workflows[projectId] = {
    projectId,
    steps: {},
  };

  saveAllWorkflows(workflows);
}

export function getWorkflow(projectId: string): ProjectWorkflow | null {
  const workflows = getAllWorkflows();
  return workflows[projectId] || null;
}

export function getStepData(projectId: string, stepNumber: number): WorkflowStepData | null {
  const workflow = getWorkflow(projectId);
  return workflow?.steps[stepNumber] || null;
}

export function saveStepData(
  projectId: string,
  stepNumber: number,
  data: any,
  isComplete: boolean = false
): void {
  const workflows = getAllWorkflows();

  if (!workflows[projectId]) {
    initializeWorkflow(projectId);
  }

  const now = new Date().toISOString();

  workflows[projectId].steps[stepNumber] = {
    stepNumber,
    status: isComplete ? 'complete' : 'incomplete',
    data,
    completedAt: isComplete ? now : undefined,
  };

  saveAllWorkflows(workflows);

  // Update project's current step and completion percentage
  if (isComplete) {
    updateProjectProgress(projectId, stepNumber);
  }
}

export function completeStep(projectId: string, stepNumber: number): void {
  const workflow = getWorkflow(projectId);
  if (!workflow || !workflow.steps[stepNumber]) return;

  const stepData = workflow.steps[stepNumber];
  saveStepData(projectId, stepNumber, stepData.data, true);
}

function updateProjectProgress(projectId: string, completedStep: number): void {
  const workflow = getWorkflow(projectId);
  if (!workflow) return;

  // Count completed steps
  const completedSteps = Object.values(workflow.steps).filter(
    (step) => step.status === 'complete'
  ).length;

  const totalSteps = 11;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  // Update current step to next incomplete step or keep at completed
  const nextStep = completedStep < 11 ? completedStep + 1 : completedStep;

  updateProject(projectId, {
    currentStep: nextStep,
    completionPercentage,
  });
}

function deleteWorkflow(projectId: string): void {
  const workflows = getAllWorkflows();
  delete workflows[projectId];
  saveAllWorkflows(workflows);
}

// ===== AUTO-SAVE FUNCTIONALITY =====

let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

export function autoSaveStepData(
  projectId: string,
  stepNumber: number,
  data: any,
  debounceMs: number = 5000
): void {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  autoSaveTimeout = setTimeout(() => {
    saveStepData(projectId, stepNumber, data, false);
    console.log(`Auto-saved step ${stepNumber} for project ${projectId}`);
  }, debounceMs);
}

// ===== STATISTICS =====

export function getProjectStatistics() {
  const projects = getAllProjects();

  return {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'in_progress').length,
    approved: projects.filter((p) => p.status === 'approved').length,
    rejected: projects.filter((p) => p.status === 'rejected').length,
    byType: {
      reverse_engineering: projects.filter((p) => p.type === 'reverse_engineering').length,
      va_ve: projects.filter((p) => p.type === 'va_ve').length,
    },
  };
}

// ===== EXPORT/IMPORT =====

export function exportAllData(): string {
  const projects = getAllProjects();
  const workflows = getAllWorkflows();

  return JSON.stringify(
    {
      projects,
      workflows,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

export function importAllData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);

    if (data.projects && data.workflows) {
      safeJSONStringify(PROJECTS_KEY, data.projects);
      safeJSONStringify(WORKFLOWS_KEY, data.workflows);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

// ===== CLEAR ALL DATA (for development/testing) =====

export function clearAllData(): void {
  localStorage.removeItem(PROJECTS_KEY);
  localStorage.removeItem(WORKFLOWS_KEY);
}
