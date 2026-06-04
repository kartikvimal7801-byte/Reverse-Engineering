import { Box, Typography, Button, Paper } from '@mui/material';

interface StepPlaceholderProps {
  stepNumber: number;
  stepTitle: string;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
}

export function StepPlaceholder({ stepNumber, stepTitle, onNext, onBack, onComplete }: StepPlaceholderProps) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Step {stepNumber}: {stepTitle}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        This step is under construction.
      </Typography>

      <Paper sx={{ p: 4, my: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Step {stepNumber} - {stepTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Component implementation in progress
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={onBack} disabled={stepNumber === 1}>
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={onComplete}>
            Mark Complete
          </Button>
          <Button variant="contained" onClick={onNext} disabled={stepNumber === 11}>
            Next Step
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
