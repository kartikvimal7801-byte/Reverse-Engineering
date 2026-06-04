import { StepPlaceholder } from './StepPlaceholder';
import { useProject } from '../../context/ProjectContext';

interface StepProps {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step2TeardownDocumentation({ onNext, onBack }: StepProps) {
  const { completeStep, saveStepData } = useProject();

  const handleComplete = () => {
    saveStepData(2, {}, true);
    completeStep(2);
  };

  return (
    <StepPlaceholder
      stepNumber={2}
      stepTitle="Product Teardown Documentation"
      onNext={onNext}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}
