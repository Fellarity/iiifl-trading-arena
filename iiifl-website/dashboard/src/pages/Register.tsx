import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ModeToggle } from '../components/ui/mode-toggle';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    pan: '',
    aadhaar: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Register User
      const res = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone_number: formData.phone_number
      });

      // 2. Simulate KYC (In real app, we'd post PAN/Aadhaar to a KYC endpoint)
      // For now, we assume registration creates the user and logs them in.
      
      const { token, data } = res.data;
      login(token, data.user);
      
      // Redirect to Dashboard
      navigate('/dashboard');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4 relative">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <Card className="w-full max-w-md shadow-xl border-border bg-card">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-primary">Open Demat Account</CardTitle>
          <p className="text-sm text-muted-foreground">Step {step} of 2</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 1 ? handleNext : handleRegister} className="space-y-4">
            
            {error && <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input name="full_name" required className="w-full px-3 py-2 border border-input rounded-md bg-background" value={formData.full_name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input name="email" type="email" required className="w-full px-3 py-2 border border-input rounded-md bg-background" value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <input name="password" type="password" required className="w-full px-3 py-2 border border-input rounded-md bg-background" value={formData.password} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Mobile Number</label>
                  <input name="phone_number" required className="w-full px-3 py-2 border border-input rounded-md bg-background" value={formData.phone_number} onChange={handleChange} />
                </div>
                <Button className="w-full mt-4" type="submit">Next: KYC Details</Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">PAN Number</label>
                  <input name="pan" required className="w-full px-3 py-2 border border-input rounded-md bg-background uppercase" placeholder="ABCDE1234F" value={formData.pan} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Aadhaar Number</label>
                  <input name="aadhaar" required className="w-full px-3 py-2 border border-input rounded-md bg-background" placeholder="12-digit number" value={formData.aadhaar} onChange={handleChange} />
                </div>
                
                <div className="flex gap-2 mt-6">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? 'Opening Account...' : 'Complete Verification'}
                    </Button>
                </div>
              </>
            )}

          </form>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <span className="text-primary hover:underline cursor-pointer" onClick={() => navigate('/login')}>Log in</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
