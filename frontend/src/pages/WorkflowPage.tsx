import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  alpha,
  styled,
} from '@mui/material';
import { ArrowBack, CheckCircle, Lock, RadioButtonUnchecked } from '@mui/icons-material';
import { useProject } from '../context/ProjectContext';

// Import step components
import { Step1BenchmarkSelection } from '../components/steps/Step1BenchmarkSelection';
import { Step2TeardownDocumentation } from '../components/steps/Step2TeardownDocumentation';
import { Step3MeasurementCapture } from '../components/steps/Step3MeasurementCapture';
import { Step4MaterialIdentification } from '../components/steps/Step4MaterialIdentification';
import { Step5PerformanceBenchmarking } from '../components/steps/Step5PerformanceBenchmarking';
import { Step6CostBreakdown } from '../components/steps/Step6CostBreakdown';
import { Step7AIEvaluation } from '../components/steps/Step7AIEvaluation';
import { Step8ValueEngineering } from '../components/steps/Step8ValueEngineering';
import { Step9ConceptGeneration } from '../components/steps/Step9ConceptGeneration';
import { Step10ManagementReview } from '../components/steps/Step10ManagementReview';
import { Step11FinalReport } from '../components/steps/Step11FinalReport';

const WORKFLOW_STEPS = [
  { id: 1, title: 'Benchmark Selection', shortTitle: 'Selection', icon: '📊' },
  { id: 2, title: 'Teardown Documentation', shortTitle: 'Teardown', icon: '🔧' },
  { id: 3, title: '3D Measurement', shortTitle: 'Measurement', icon: '📏' },
  { id: 4, title: 'Material Analysis', shortTitle: 'Materials', icon: '🧪' },
  { id: 5, title: 'Performance Analysis', shortTitle: 'Performance', icon: '⚡' },
  { id: 6, title: 'Cost Analysis', shortTitle: 'Cost', icon: '💰' },
  { id: 7, title: 'AI Evaluation', shortTitle: 'AI Eval', icon: '🤖' },
  { id: 8, title: 'Value Engineering', shortTitle: 'VA/VE', icon: '💡' },
  { id: 9, title: 'Concept Generation', shortTitle: 'Concept', icon: '🎯' },
  { id: 10, title: 'Management Review', shortTitle: 'Review', icon: '✓' },
  { id: 11, title: 'Final Report', shortTitle: 'Report', icon: '📄' },
];

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.3)',
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.light, 0.2)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
  },
}));

interface StepCardProps {
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  active: boolean;
}

const StepCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'status' && prop !== 'active',
})<StepCardProps>(({ theme, status, active }) => {
  let bgColor = theme.palette.grey[800];
  let borderColor = theme.palette.grey[700];
  let boxShadow = '0 2px 8px 0 rgba(0, 0, 0, 0.2)';

  if (status === 'locked') {
    bgColor = alpha(theme.palette.grey[900], 0.6);
    borderColor = theme.palette.grey[800];
  } else if (status === 'available') {
    bgColor = alpha(theme.palette.primary.dark, 0.3);
    borderColor = theme.palette.primary.dark;
  } else if (status === 'in_progress') {
    bgColor = alpha(theme.palette.secondary.dark, 0.3);
    borderColor = theme.palette.secondary.main;
    boxShadow = `0 0 20px 0 ${alpha(theme.palette.secondary.main, 0.5)}`;
  } else if (status === 'completed') {
    bgColor = alpha(theme.palette.success.dark, 0.3);
    borderColor = theme.palette.success.main;
  }

  if (active) {
    boxShadow = `0 0 30px 0 ${alpha(theme.palette.primary.main, 0.8)}`;
    borderColor = theme.palette.primary.light;
  }

  return {
    background: bgColor,
    border: `2px solid ${borderColor}`,
    boxShadow: boxShadow,
    cursor: status !== 'locked' ? 'pointer' : 'not-allowed',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'visible',
    '&:hover': status !== 'locked' ? {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: `0 8px 30px 0 ${alpha(borderColor, 0.6)}`,
      borderColor: theme.palette.primary.light,
    } : {},
  };
});

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 14,
  borderRadius: 7,
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 7,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
  },
}));

const WorkflowRibbon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(4, 0),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 4,
    background: alpha(theme.palette.primary.main, 0.3),
    zIndex: 0,
  },
}));

interface WorkflowNodeProps {
  status: 'locked' | 'available' | 'in_progress' | 'completed';
}

const WorkflowNode = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<WorkflowNodeProps>(({ theme, status }) => {
  let bgColor = theme.palette.grey[700];
  let borderColor = theme.palette.grey[600];

  if (status === 'completed') {
    bgColor = theme.palette.success.main;
    borderColor = theme.palette.success.light;
  } else if (status === 'in_progress') {
    bgColor = theme.palette.secondary.main;
    borderColor = theme.palette.secondary.light;
  } else if (status === 'available') {
    bgColor = theme.palette.primary.main;
    borderColor = theme.palette.primary.light;
  }

  return {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: bgColor,
    border: `3px solid ${borderColor}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    boxShadow: `0 0 20px ${alpha(bgColor, 0.6)}`,
    transition: 'all 0.3s ease',
  };
});

export function WorkflowPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject, currentWorkflow } = useProject();
  const [currentStepNumber, setCurrentStepNumber] = useState(1);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    } else {
      setCurrentProject(null);
    }
  }, [projectId, setCurrentProject]);

  useEffect(() => {
    if (currentProject) {
      setCurrentStepNumber(currentProject.currentStep);
    }
  }, [currentProject]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setSelectedStep(null);
    };
  }, []);

  // If no projectId in URL, don't render this component
  if (!projectId) {
    return null;
  }

  // If no current project loaded, redirect to dashboard instead of showing error
  if (!currentProject) {
    navigate('/', { replace: true });
    return null;
  }

  const getCompletedSteps = (): Set<number> => {
    const completed = new Set<number>();
    if (currentWorkflow) {
      Object.entries(currentWorkflow.steps).forEach(([stepNum, stepData]) => {
        if (stepData.status === 'complete') {
          completed.add(parseInt(stepNum));
        }
      });
    }
    return completed;
  };

  const completedSteps = getCompletedSteps();

  const getStepStatus = (stepId: number): 'locked' | 'available' | 'in_progress' | 'completed' => {
    if (completedSteps.has(stepId)) return 'completed';
    if (stepId === currentStepNumber) return 'in_progress';
    if (stepId < currentStepNumber) return 'available';
    return 'locked';
  };

  const handleStepClick = (stepId: number) => {
    const status = getStepStatus(stepId);
    if (status !== 'locked') {
      setSelectedStep(stepId);
    }
  };

  const handleCloseStep = () => {
    setSelectedStep(null);
  };

  const handleBackToDashboard = () => {
    setCurrentProject(null);
    navigate('/', { replace: true });
  };

  const renderStepContent = () => {
    if (selectedStep === null) return null;

    const stepProps = {
      projectId: currentProject.id,
      onNext: () => {
        const nextStep = Math.min(selectedStep + 1, 11);
        setSelectedStep(nextStep);
      },
      onBack: () => {
        const prevStep = Math.max(selectedStep - 1, 1);
        setSelectedStep(prevStep);
      },
    };

    switch (selectedStep) {
      case 1:
        return <Step1BenchmarkSelection {...stepProps} />;
      case 2:
        return <Step2TeardownDocumentation {...stepProps} />;
      case 3:
        return <Step3MeasurementCapture {...stepProps} />;
      case 4:
        return <Step4MaterialIdentification {...stepProps} />;
      case 5:
        return <Step5PerformanceBenchmarking {...stepProps} />;
      case 6:
        return <Step6CostBreakdown {...stepProps} />;
      case 7:
        return <Step7AIEvaluation {...stepProps} />;
      case 8:
        return <Step8ValueEngineering {...stepProps} />;
      case 9:
        return <Step9ConceptGeneration {...stepProps} />;
      case 10:
        return <Step10ManagementReview {...stepProps} />;
      case 11:
        return <Step11FinalReport {...stepProps} />;
      default:
        return null;
    }
  };

  const getStepIcon = (stepId: number) => {
    const status = getStepStatus(stepId);
    if (status === 'completed') return <CheckCircle sx={{ color: 'success.light', fontSize: 24 }} />;
    if (status === 'in_progress') return <RadioButtonUnchecked sx={{ color: 'secondary.light', fontSize: 24 }} />;
    if (status === 'locked') return <Lock sx={{ color: 'grey.500', fontSize: 20 }} />;
    return <RadioButtonUnchecked sx={{ color: 'primary.light', fontSize: 24 }} />;
  };

  if (selectedStep !== null) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <StyledAppBar position="static" elevation={0}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleCloseStep} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {WORKFLOW_STEPS[selectedStep - 1].title}
            </Typography>
            <Chip
              label={`Step ${selectedStep}/11`}
              color="secondary"
              sx={{ fontWeight: 600 }}
            />
          </Toolbar>
        </StyledAppBar>
        <Container maxWidth={false} sx={{ px: 4, py: 4 }}>
          {renderStepContent()}
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StyledAppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBackToDashboard} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              Reverse Engineering Management System
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Enterprise Platform v2.0
            </Typography>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Container maxWidth={false} sx={{ px: 4, py: 4 }}>
        {/* Dashboard Header */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <DashboardCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" sx={{ opacity: 0.7, fontSize: '0.75rem', letterSpacing: 1.5 }}>
                  Current Project
                </Typography>
                <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, fontSize: '2rem' }}>
                  {currentProject.name}
                </Typography>
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Overall Project Progress
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.light' }}>
                      {currentProject.completionPercentage}%
                    </Typography>
                  </Box>
                  <ProgressBar variant="determinate" value={currentProject.completionPercentage} />
                </Box>
              </CardContent>
            </DashboardCard>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ height: '100%', background: alpha('#2196f3', 0.1), border: '1px solid rgba(33, 150, 243, 0.3)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
                      Current Step
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.light', my: 1 }}>
                      {currentStepNumber}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      of 11 Steps
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ height: '100%', background: alpha('#4caf50', 0.1), border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
                      Completed
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 700, color: 'success.light', my: 1 }}>
                      {completedSteps.size}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Steps Done
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Instructional Card */}
        <Card
          sx={{
            mb: 4,
            p: 4,
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.05) 100%)',
            border: '2px solid rgba(33, 150, 243, 0.3)',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
              }}
            >
              💡
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Get Started
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Click on any step card below to begin entering data. Complete each step to track your progress through the workflow.
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Workflow Ribbon */}
        <Card sx={{ mb: 4, p: 4, background: alpha('#132f4c', 0.6) }}>
          <Typography variant="overline" sx={{ mb: 3, display: 'block', fontSize: '0.75rem', letterSpacing: 1.5 }}>
            Workflow Pipeline
          </Typography>
          <WorkflowRibbon>
            {WORKFLOW_STEPS.map((step) => (
              <WorkflowNode key={step.id} status={getStepStatus(step.id)}>
                {getStepStatus(step.id) === 'completed' ? (
                  <CheckCircle sx={{ color: 'white', fontSize: 24 }} />
                ) : (
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'white' }}>
                    {step.id}
                  </Typography>
                )}
              </WorkflowNode>
            ))}
          </WorkflowRibbon>
        </Card>

        {/* Step Cards Grid */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, letterSpacing: 0.5 }}>
          Engineering Workflow Steps
        </Typography>
        <Grid container spacing={3}>
          {WORKFLOW_STEPS.map((step) => {
            const status = getStepStatus(step.id);
            const isActive = step.id === currentStepNumber;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={step.id}>
                <StepCard
                  status={status}
                  active={isActive}
                  onClick={() => handleStepClick(step.id)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                      <Typography variant="h3" sx={{ opacity: 0.8, fontSize: '2.5rem' }}>
                        {step.icon}
                      </Typography>
                      {getStepIcon(step.id)}
                    </Box>

                    <Typography variant="overline" sx={{ fontSize: '0.7rem', opacity: 0.7, display: 'block', mb: 0.5 }}>
                      Step {step.id}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, minHeight: 52, fontSize: '1.1rem' }}>
                      {step.title}
                    </Typography>

                    <Chip
                      label={
                        status === 'locked' ? 'Locked' :
                        status === 'completed' ? 'Completed' :
                        status === 'in_progress' ? 'In Progress' :
                        'Available'
                      }
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        backgroundColor:
                          status === 'locked' ? alpha('#fff', 0.1) :
                          status === 'completed' ? alpha('#4caf50', 0.3) :
                          status === 'in_progress' ? alpha('#ff9800', 0.3) :
                          alpha('#2196f3', 0.3),
                      }}
                    />
                  </CardContent>
                </StepCard>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
