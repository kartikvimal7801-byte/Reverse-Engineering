import { StepPlaceholder } from './StepPlaceholder';
import { useProject } from '../../context/ProjectContext';

interface StepProps {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step9ConceptGeneration({ onNext, onBack }: StepProps) {
  const { completeStep, saveStepData } = useProject();

  const handleComplete = () => {
    saveStepData(9, {}, true);
    completeStep(9);
  };

  return (
    <StepPlaceholder
      stepNumber={9}
      stepTitle="New Product Concept Generation"
      onNext={onNext}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}
