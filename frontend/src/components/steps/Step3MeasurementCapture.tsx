import { StepPlaceholder } from './StepPlaceholder';
import { useProject } from '../../context/ProjectContext';

interface StepProps {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step3MeasurementCapture({ onNext, onBack }: StepProps) {
  const { completeStep, saveStepData } = useProject();

  const handleComplete = () => {
    saveStepData(3, {}, true);
    completeStep(3);
  };

  return (
    <StepPlaceholder
      stepNumber={3}
      stepTitle="3D Scanning and Measurement Capture"
      onNext={onNext}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}
