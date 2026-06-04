import { Stepper, Step, StepLabel, StepButton, Box, styled } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, Lock } from '@mui/icons-material';

const WORKFLOW_STEPS = [
  'Product Selection',
  'Teardown Documentation',
  'Measurement Capture',
  'Material Identification',
  'Performance Benchmarking',
  'Cost Breakdown',
  'AI Design Evaluation',
  'Value Engineering',
  'Concept Generation',
  'Management Review',
  'Final Report',
];

interface WorkflowStepperProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

const StepperContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(4),
  overflowX: 'auto',
}));

export function WorkflowStepper({ currentStep, completedSteps, onStepClick }: WorkflowStepperProps) {
  const getStepIcon = (step: number) => {
    const stepNumber = step + 1;
    
    if (completedSteps.has(stepNumber)) {
      return <CheckCircle color="success" />;
    } else if (stepNumber === currentStep) {
      return <RadioButtonUnchecked color="primary" />;
    } else if (stepNumber < currentStep) {
      // Can navigate back to this step
      return <RadioButtonUnchecked color="action" />;
    } else {
      // Locked future step
      return <Lock color="disabled" />;
    }
  };

  const canNavigateToStep = (step: number): boolean => {
    const stepNumber = step + 1;
    // Can navigate to completed steps or steps before current
    return stepNumber <= currentStep;
  };

  return (
    <StepperContainer>
      <Stepper activeStep={currentStep - 1} alternativeLabel sx={{ flexWrap: 'wrap' }}>
        {WORKFLOW_STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.has(stepNumber);
          const isCurrent = stepNumber === currentStep;
          const canNavigate = canNavigateToStep(index);

          return (
            <Step key={label} completed={isCompleted}>
              {canNavigate ? (
                <StepButton
                  onClick={() => onStepClick(stepNumber)}
                  icon={getStepIcon(index)}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.875rem',
                      fontWeight: isCurrent ? 600 : 400,
                    },
                  }}
                >
                  {label}
                </StepButton>
              ) : (
                <StepLabel
                  icon={getStepIcon(index)}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.875rem',
                      color: 'text.disabled',
                    },
                  }}
                >
                  {label}
                </StepLabel>
              )}
            </Step>
          );
        })}
      </Stepper>
    </StepperContainer>
  );
}
