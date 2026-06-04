import { StepPlaceholder } from './StepPlaceholder';
import { useProject } from '../../context/ProjectContext';

interface StepProps {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step10ManagementReview({ onNext, onBack }: StepProps) {
  const { completeStep, saveStepData } = useProject();

  const handleComplete = () => {
    saveStepData(10, {}, true);
    completeStep(10);
  };

  return (
    <StepPlaceholder
      stepNumber={10}
      stepTitle="Management Review"
      onNext={onNext}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}
