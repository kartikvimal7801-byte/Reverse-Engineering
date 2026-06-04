import { StepPlaceholder } from './StepPlaceholder';
import { useProject } from '../../context/ProjectContext';

interface StepProps {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step11FinalReport({ onNext, onBack }: StepProps) {
  const { completeStep, saveStepData } = useProject();

  const handleComplete = () => {
    saveStepData(11, {}, true);
    completeStep(11);
  };

  return (
    <StepPlaceholder
      stepNumber={11}
      stepTitle="Final Report Generation"
      onNext={onNext}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}
