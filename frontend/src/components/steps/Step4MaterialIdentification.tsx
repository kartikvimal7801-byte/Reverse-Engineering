import { StepPlaceholder } from './StepPlaceholder';
import { useProject } from '../../context/ProjectContext';

interface StepProps {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step4MaterialIdentification({ onNext, onBack }: StepProps) {
  const { completeStep, saveStepData } = useProject();

  const handleComplete = () => {
    saveStepData(4, {}, true);
    completeStep(4);
  };

  return (
    <StepPlaceholder
      stepNumber={4}
      stepTitle="Material Identification"
      onNext={onNext}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}
