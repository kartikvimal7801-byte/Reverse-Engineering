import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { useProject } from '../../context/ProjectContext';
import type { Step1Data } from '../../types';

interface StepProps {
  projectId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step1BenchmarkSelection({ onNext }: StepProps) {
  const { getStepData, saveStepData, autoSaveStepData, completeStep } = useProject();

  const [formData, setFormData] = useState<Step1Data>({
    productName: '',
    modelNumber: '',
    manufacturer: '',
    category: '',
    supplierInfo: {},
    marketData: {},
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedData = getStepData(1);
    if (savedData) {
      setFormData(savedData);
    }
  }, [getStepData]);

  useEffect(() => {
    // Auto-save on data change
    autoSaveStepData(1, formData);
  }, [formData, autoSaveStepData]);

  const handleChange = (field: keyof Step1Data, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSupplierChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      supplierInfo: { ...prev.supplierInfo, [field]: value },
    }));
  };

  const handleMarketChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      marketData: { ...prev.marketData, [field]: value },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentImages = formData.images || [];
    if (currentImages.length + files.length > 10) {
      setErrors((prev) => ({ ...prev, images: 'Maximum 10 images allowed' }));
      return;
    }

    // Convert images to Base64
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, images: 'Each image must be less than 10MB' }));
        return;
      }

      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        setErrors((prev) => ({ ...prev, images: 'Only PNG, JPEG, JPG formats allowed' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), base64],
        }));
      };
      reader.readAsDataURL(file);
    });

    setErrors((prev) => ({ ...prev, images: '' }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    if (!formData.modelNumber.trim()) {
      newErrors.modelNumber = 'Model number is required';
    }
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Manufacturer is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = () => {
    if (!validate()) return;

    saveStepData(1, formData, true);
    completeStep(1);
    onNext();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Step 1: Benchmark Product Selection
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter details about the pump you're analyzing for reverse engineering.
      </Typography>

      <Grid container spacing={3}>
        {/* Basic Product Info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Product Name"
                  value={formData.productName}
                  onChange={(e) => handleChange('productName', e.target.value)}
                  error={!!errors.productName}
                  helperText={errors.productName}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Model Number"
                  value={formData.modelNumber}
                  onChange={(e) => handleChange('modelNumber', e.target.value)}
                  error={!!errors.modelNumber}
                  helperText={errors.modelNumber}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                  error={!!errors.manufacturer}
                  helperText={errors.manufacturer}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Supplier Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Supplier Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Supplier Name"
                  value={formData.supplierInfo?.supplierName || ''}
                  onChange={(e) => handleSupplierChange('supplierName', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Contact Information"
                  value={formData.supplierInfo?.contactInfo || ''}
                  onChange={(e) => handleSupplierChange('contactInfo', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Unit Price"
                  type="number"
                  value={formData.supplierInfo?.unitPrice || ''}
                  onChange={(e) => handleSupplierChange('unitPrice', parseFloat(e.target.value))}
                  fullWidth
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Market Data */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Market Data
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Price Range"
                  value={formData.marketData?.priceRange || ''}
                  onChange={(e) => handleMarketChange('priceRange', e.target.value)}
                  fullWidth
                  placeholder="e.g., $5000 - $8000"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Availability Status"
                  value={formData.marketData?.availability || ''}
                  onChange={(e) => handleMarketChange('availability', e.target.value)}
                  fullWidth
                  placeholder="e.g., In Stock, 2-3 weeks lead time"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Image Upload */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product Images
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload up to 10 images (PNG, JPEG, JPG) - max 10MB each
            </Typography>

            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              sx={{ mt: 2 }}
              disabled={(formData.images?.length || 0) >= 10}
            >
              Upload Images
              <input
                type="file"
                hidden
                accept="image/png,image/jpeg,image/jpg"
                multiple
                onChange={handleImageUpload}
              />
            </Button>

            {errors.images && (
              <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                {errors.images}
              </Typography>
            )}

            {formData.images && formData.images.length > 0 && (
              <ImageList sx={{ mt: 2 }} cols={4} gap={8}>
                {formData.images.map((image, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      loading="lazy"
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                    <ImageListItemBar
                      actionIcon={
                        <IconButton
                          sx={{ color: 'white' }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Paper>
        </Grid>

        {/* Navigation */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="contained" onClick={handleComplete} size="large">
              Complete Step 1
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
