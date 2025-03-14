import { useState, useEffect } from "react";
import { 
  Container, TextField, Button, Typography, Box, CircularProgress, 
  Paper, Stepper, Step, StepLabel, IconButton, MobileStepper,
  InputAdornment, FormControl, FormHelperText, OutlinedInput, 
  InputLabel, Slide, Fade, useTheme, useMediaQuery
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../Store/Store";
import Layout from "../Layout/Layout";
import { toast } from "react-toastify";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  HowToReg as HowToRegIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

export default function SignUp() {
  const { signup } = useStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Define the steps
  const steps = [
    {
      label: 'Name',
      fields: ['firstName', 'lastName'],
      icon: <PersonIcon />
    },
    {
      label: 'Contact',
      fields: ['email', 'phoneNumber'],
      icon: <EmailIcon />
    },
    {
      label: 'Security',
      fields: ['password', 'confirmPassword'],
      icon: <LockIcon />
    },
  ];

  // Get current fields based on active step
  const currentFields = steps[activeStep]?.fields || [];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Validate only the current fields
  const validateCurrentStep = () => {
    let tempErrors = {};
    let isValid = true;
    
    if (currentFields.includes('firstName') && !formData.firstName.trim()) {
      tempErrors.firstName = 'First name is required';
      isValid = false;
    }
    
    if (currentFields.includes('lastName') && !formData.lastName.trim()) {
      tempErrors.lastName = 'Last name is required';
      isValid = false;
    }
    
    if (currentFields.includes('email')) {
      if (!formData.email.trim()) {
        tempErrors.email = 'Email is required';
        isValid = false;
      } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(formData.email)) {
        tempErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }
    
    if (currentFields.includes('phoneNumber')) {
      if (!formData.phoneNumber.trim()) {
        tempErrors.phoneNumber = 'Phone number is required';
        isValid = false;
      } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
        tempErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
        isValid = false;
      }
    }
    
    if (currentFields.includes('password')) {
      if (!formData.password) {
        tempErrors.password = 'Password is required';
        isValid = false;
      } else if (formData.password.length < 6) {
        tempErrors.password = 'Password must be at least 6 characters';
        isValid = false;
      }
    }
    
    if (currentFields.includes('confirmPassword')) {
      if (!formData.confirmPassword) {
        tempErrors.confirmPassword = 'Please confirm your password';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        tempErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }
    
    setErrors(tempErrors);
    return isValid;
  };

  // Validate all fields before final submission
  const validateAllFields = () => {
    let tempErrors = {};
    
    if (!formData.firstName.trim()) tempErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) tempErrors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phoneNumber.trim()) {
      tempErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      tempErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateAllFields()) {
      setLoading(true);
      try {
        const response = await signup(formData);

        if (response?.valid) {
          toast.success(`Account created successfully!`);
          setTimeout(() => navigate('/login'), 2000);
        } else {
          toast.error(response?.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        console.error('Signup error:', error);
        toast.error('Registration failed. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in={activeStep === 0} timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Let's get started with your name
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please enter your first and last name as it appears on your official documents.
              </Typography>
              
              <FormControl fullWidth margin="normal" error={!!errors.firstName}>
                <InputLabel htmlFor="firstName">First Name</InputLabel>
                <OutlinedInput
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  }
                  label="First Name"
                  autoFocus
                />
                {errors.firstName && <FormHelperText>{errors.firstName}</FormHelperText>}
              </FormControl>
              
              <FormControl fullWidth margin="normal" error={!!errors.lastName}>
                <InputLabel htmlFor="lastName">Last Name</InputLabel>
                <OutlinedInput
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  }
                  label="Last Name"
                />
                {errors.lastName && <FormHelperText>{errors.lastName}</FormHelperText>}
              </FormControl>
            </Box>
          </Fade>
        );
      
      case 1:
        return (
          <Fade in={activeStep === 1} timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Your contact information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We'll use these details to verify your account and keep you updated.
              </Typography>
              
              <FormControl fullWidth margin="normal" error={!!errors.email}>
                <InputLabel htmlFor="email">Email Address</InputLabel>
                <OutlinedInput
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  }
                  label="Email Address"
                  autoFocus
                />
                {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
              </FormControl>
              
              <FormControl fullWidth margin="normal" error={!!errors.phoneNumber}>
                <InputLabel htmlFor="phoneNumber">Phone Number</InputLabel>
                <OutlinedInput
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  }
                  label="Phone Number"
                />
                {errors.phoneNumber && <FormHelperText>{errors.phoneNumber}</FormHelperText>}
              </FormControl>
            </Box>
          </Fade>
        );
      
      case 2:
        return (
          <Fade in={activeStep === 2} timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Create a secure password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your password should be at least 6 characters long and include a mix of letters and numbers.
              </Typography>
              
              <FormControl fullWidth margin="normal" error={!!errors.password}>
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                  autoFocus
                />
                {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
              </FormControl>
              
              <FormControl fullWidth margin="normal" error={!!errors.confirmPassword}>
                <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
                <OutlinedInput
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Confirm Password"
                />
                {errors.confirmPassword && <FormHelperText>{errors.confirmPassword}</FormHelperText>}
              </FormControl>
            </Box>
          </Fade>
        );
      
      case 3:
        return (
          <Fade in={activeStep === 3} timeout={500}>
            <Box sx={{ textAlign: "center", py: 2 }}>
              <HowToRegIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                Ready to create your account
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Please review your information before submitting:
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Name:</Typography>
                  <Typography variant="body2">{formData.firstName} {formData.lastName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body2">{formData.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Phone:</Typography>
                  <Typography variant="body2">{formData.phoneNumber}</Typography>
                </Box>
              </Paper>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                By clicking "Create Account", you agree to our Terms of Service and Privacy Policy.
              </Typography>
            </Box>
          </Fade>
        );
      
      default:
        return null;
    }
  };

  return (
    <Layout title={"Vmarg - Sign Up"}>
      <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 } }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton
            onClick={() => navigate('/login')}
            sx={{ color: 'primary.main' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight="bold" textAlign="center" sx={{ flex: 1 }}>
            Create Account
          </Typography>
          <Box sx={{ width: 40 }}></Box> {/* Spacer for alignment */}
        </Box>
        
        <Paper
          elevation={2}
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: 'background.paper'
          }}
        >
          {!isMobile && (
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{ pt: 3, pb: 2, px: 2, bgcolor: 'background.subtle' }}
            >
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel 
                    StepIconProps={{ 
                      icon: index === activeStep ? step.icon : (index < activeStep ? '✓' : index + 1)
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
              <Step key="review">
                <StepLabel>Review</StepLabel>
              </Step>
            </Stepper>
          )}

          <Box sx={{ p: 3 }}>
            {renderStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<KeyboardArrowLeftIcon />}
              >
                Back
              </Button>
              
              {activeStep === steps.length ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  sx={{ 
                    backgroundColor: '#00796b',
                    '&:hover': { backgroundColor: '#00635a' },
                    px: 3
                  }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<KeyboardArrowRightIcon />}
                  sx={{ backgroundColor: '#00796b', '&:hover': { backgroundColor: '#00635a' } }}
                >
                  {activeStep === steps.length - 1 ? "Review" : "Next"}
                </Button>
              )}
            </Box>
          </Box>
          
          {isMobile && (
            <MobileStepper
              variant="dots"
              steps={steps.length + 1}
              position="static"
              activeStep={activeStep}
              sx={{ bgcolor: 'background.default' }}
              nextButton={<div />} // Empty div for layout purposes
              backButton={<div />} // Empty div for layout purposes
            />
          )}
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: theme.palette.primary.main, 
                textDecoration: 'none', 
                fontWeight: 'bold' 
              }}
            >
              Log in
            </Link>
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
}