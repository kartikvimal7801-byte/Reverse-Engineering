import { StepPlaceholder } from './StepPlaceholder';
import { useProject } from '../../context/ProjectContext';

interface StepProps {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step8ValueEngineering({ onNext, onBack }: StepProps) {
  const { completeStep, saveStepData } = useProject();

  const handleComplete = () => {
    saveStepData(8, {}, true);
    completeStep(8);
  };

  return (
    <StepPlaceholder
      stepNumber={8}
      stepTitle="Value Engineering Suggestions"
      onNext={onNext}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}
