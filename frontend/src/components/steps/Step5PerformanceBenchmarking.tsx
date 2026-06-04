import { StepPlaceholder } from './StepPlaceholder';
import { useProject } from '../../context/ProjectContext';

interface StepProps {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step5PerformanceBenchmarking({ onNext, onBack }: StepProps) {
  const { completeStep, saveStepData } = useProject();

  const handleComplete = () => {
    saveStepData(5, {}, true);
    completeStep(5);
  };

  return (
    <StepPlaceholder
      stepNumber={5}
      stepTitle="Performance Benchmarking"
      onNext={onNext}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}
