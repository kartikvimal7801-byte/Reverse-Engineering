import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
} from '@mui/icons-material';
import { useProject } from '../context/ProjectContext';
import type { ProjectType } from '../types';
import { format } from 'date-fns';

export function Dashboard() {
  const { projects, createProject, deleteProject, refreshProjects } = useProject();
  const navigate = useNavigate();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Refresh projects when Dashboard mounts
  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<ProjectType>('reverse_engineering');
  const [newProjectNotes, setNewProjectNotes] = useState('');

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const project = createProject({
      name: newProjectName.trim(),
      type: newProjectType,
      notes: newProjectNotes.trim() || undefined,
      status: 'in_progress',
      currentStep: 1,
    });

    setCreateDialogOpen(false);
    setNewProjectName('');
    setNewProjectNotes('');
    setNewProjectType('reverse_engineering');

    // Navigate to the workflow
    navigate(`/project/${project.id}`);
  };

  const handleDeleteProject = () => {
    if (selectedProjectId) {
      deleteProject(selectedProjectId);
      setDeleteDialogOpen(false);
      setSelectedProjectId(null);
    }
  };

  const openDeleteDialog = (projectId: string) => {
    setSelectedProjectId(projectId);
    setDeleteDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'primary';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: ProjectType) => {
    return type === 'reverse_engineering' ? 'Reverse Engineering' : 'VA/VE';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          py: 6,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.3)',
        }}
      >
        <Container maxWidth={false} sx={{ px: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                Project Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Reverse Engineering Management System
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                fontWeight: 600,
                px: 4,
                py: 1.5,
              }}
            >
              Create Project
            </Button>
          </Box>
        </Container>
      </Box>
      
      <Container maxWidth={false} sx={{ px: 4 }}>

      {projects.length === 0 ? (
        <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
          <Card
            sx={{
              textAlign: 'center',
              py: 8,
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
            }}
          >
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              No projects yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first reverse engineering or VA/VE project to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              size="large"
            >
              Create Project
            </Button>
          </CardContent>
        </Card>
        </Box>
      ) : (
        <Box sx={{ py: 4 }}>
          <Grid container spacing={4}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.8) 0%, rgba(19, 47, 76, 0.6) 100%)',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 48px 0 rgba(0, 0, 0, 0.6)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                    <Chip
                      label={getTypeLabel(project.type)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={project.status.replace('_', ' ')}
                      size="small"
                      color={getStatusColor(project.status)}
                    />
                  </Box>

                  <Typography variant="h5" component="h2" gutterBottom noWrap sx={{ fontWeight: 700, mb: 1.5 }}>
                    {project.name}
                  </Typography>

                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5 }}>
                    Step {project.currentStep} of 11
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={project.completionPercentage}
                    sx={{
                      mb: 2.5,
                      height: 12,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1.5,
                        background: 'linear-gradient(90deg, #2196f3 0%, #4caf50 100%)',
                      },
                    }}
                  />

                  <Typography variant="body2" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" display="block">
                    Progress: {project.completionPercentage}%
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
                  <Button
                    size="medium"
                    variant="contained"
                    startIcon={<StartIcon />}
                    onClick={() => navigate(`/project/${project.id}`)}
                    sx={{ px: 3 }}
                  >
                    Continue
                  </Button>
                  <Box>
                    <IconButton size="medium" color="error" onClick={() => openDeleteDialog(project.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        </Box>
      )}

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              fullWidth
              required
              autoFocus
            />

            <FormControl fullWidth>
              <InputLabel>Project Type</InputLabel>
              <Select
                value={newProjectType}
                label="Project Type"
                onChange={(e) => setNewProjectType(e.target.value as ProjectType)}
              >
                <MenuItem value="reverse_engineering">Reverse Engineering</MenuItem>
                <MenuItem value="va_ve">VA/VE Analysis</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Notes (Optional)"
              value={newProjectNotes}
              onChange={(e) => setNewProjectNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={!newProjectName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
}
