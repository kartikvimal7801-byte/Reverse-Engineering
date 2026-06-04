import { StepPlaceholder } from './StepPlaceholder';
import { useProject } from '../../context/ProjectContext';

interface StepProps {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step7AIEvaluation({ onNext, onBack }: StepProps) {
  const { completeStep, saveStepData } = useProject();

  const handleComplete = () => {
    saveStepData(7, {}, true);
    completeStep(7);
  };

  return (
    <StepPlaceholder
      stepNumber={7}
      stepTitle="AI Design Evaluation"
      onNext={onNext}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}
