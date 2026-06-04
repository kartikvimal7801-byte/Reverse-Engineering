import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Project, ProjectWorkflow } from '../types';
import * as storage from '../services/localStorage';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  currentWorkflow: ProjectWorkflow | null;
  loading: boolean;
  
  // Project operations
  createProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'completionPercentage'>) => Project;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  deleteProject: (id: string) => boolean;
  setCurrentProject: (id: string | null) => void;
  refreshProjects: () => void;
  
  // Workflow operations
  getStepData: (stepNumber: number) => any;
  saveStepData: (stepNumber: number, data: any, isComplete?: boolean) => void;
  autoSaveStepData: (stepNumber: number, data: any) => void;
  completeStep: (stepNumber: number) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [currentWorkflow, setCurrentWorkflow] = useState<ProjectWorkflow | null>(null);
  const [loading, setLoading] = useState(true);

  // Load projects on mount
  useEffect(() => {
    refreshProjects();
    setLoading(false);
  }, []);

  // Load workflow when current project changes
  useEffect(() => {
    if (currentProject) {
      const workflow = storage.getWorkflow(currentProject.id);
      setCurrentWorkflow(workflow);
    } else {
      setCurrentWorkflow(null);
    }
  }, [currentProject]);

  const refreshProjects = useCallback(() => {
    const allProjects = storage.getAllProjects();
    setProjects(allProjects);
  }, []);

  const createProject = (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'completionPercentage'>
  ) => {
    const newProject = storage.createProject(projectData);
    refreshProjects();
    return newProject;
  };

  const updateProject = (
    id: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt'>>
  ) => {
    const updated = storage.updateProject(id, updates);
    if (updated) {
      refreshProjects();
      if (currentProject?.id === id) {
        setCurrentProjectState(updated);
      }
    }
  };

  const deleteProject = (id: string) => {
    const success = storage.deleteProject(id);
    if (success) {
      refreshProjects();
      if (currentProject?.id === id) {
        setCurrentProjectState(null);
      }
    }
    return success;
  };

  const setCurrentProject = (id: string | null) => {
    if (id === null) {
      setCurrentProjectState(null);
    } else {
      const project = storage.getProjectById(id);
      setCurrentProjectState(project);
    }
  };

  const getStepData = (stepNumber: number) => {
    if (!currentProject) return null;
    const stepData = storage.getStepData(currentProject.id, stepNumber);
    return stepData?.data || null;
  };

  const saveStepData = (stepNumber: number, data: any, isComplete: boolean = false) => {
    if (!currentProject) return;
    storage.saveStepData(currentProject.id, stepNumber, data, isComplete);
    
    // Refresh current project to update progress
    const updated = storage.getProjectById(currentProject.id);
    if (updated) {
      setCurrentProjectState(updated);
    }
    
    // Refresh workflow
    const workflow = storage.getWorkflow(currentProject.id);
    setCurrentWorkflow(workflow);
  };

  const autoSaveStepData = (stepNumber: number, data: any) => {
    if (!currentProject) return;
    storage.autoSaveStepData(currentProject.id, stepNumber, data);
  };

  const completeStep = (stepNumber: number) => {
    if (!currentProject) return;
    storage.completeStep(currentProject.id, stepNumber);
    
    // Refresh current project
    const updated = storage.getProjectById(currentProject.id);
    if (updated) {
      setCurrentProjectState(updated);
    }
    
    // Refresh workflow
    const workflow = storage.getWorkflow(currentProject.id);
    setCurrentWorkflow(workflow);
  };

  const value: ProjectContextType = {
    projects,
    currentProject,
    currentWorkflow,
    loading,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    refreshProjects,
    getStepData,
    saveStepData,
    autoSaveStepData,
    completeStep,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
