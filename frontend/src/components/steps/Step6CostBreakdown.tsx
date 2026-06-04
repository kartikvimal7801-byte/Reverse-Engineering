import { StepPlaceholder } from './StepPlaceholder';
import { useProject } from '../../context/ProjectContext';

interface StepProps {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step6CostBreakdown({ onNext, onBack }: StepProps) {
  const { completeStep, saveStepData } = useProject();

  const handleComplete = () => {
    saveStepData(6, {}, true);
    completeStep(6);
  };

  return (
    <StepPlaceholder
      stepNumber={6}
      stepTitle="Cost Breakdown Analysis"
      onNext={onNext}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}
