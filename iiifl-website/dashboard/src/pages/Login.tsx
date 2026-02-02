import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { ModeToggle } from '../components/ui/mode-toggle';
import api from '../lib/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Creds, 2: 2FA
  const [tempToken, setTempToken] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 1) {
          const response = await api.post('/auth/login', { email, password });
          if (response.data.status === '2fa_required') {
              setTempToken(response.data.tempToken);
              setStep(2);
          } else {
              const { token, data } = response.data;
              login(token, data.user);
              navigate('/dashboard');
          }
      } else {
          // Verify 2FA
          const response = await api.post('/auth/2fa/validate', 
              { token: totpToken },
              { headers: { Authorization: `Bearer ${tempToken}` } }
          );
          const { token, data } = response.data;
          login(token, data.user);
          navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4 relative">
      {/* Top Bar with Safe Area */}
      <div className="absolute top-0 left-0 right-0 pt-safe px-6 mt-4 flex justify-between z-10">
        <div className="text-2xl font-bold text-primary tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
            iiifl
        </div>
        <div>
            <ModeToggle />
        </div>
      </div>
      
      <Card className="w-full max-w-md shadow-xl border-border bg-card mt-12">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-primary">iiifl</CardTitle>
          <p className="text-sm text-muted-foreground">
              {step === 1 ? 'Enter your credentials to access your terminal' : 'Enter 6-digit 2FA Code'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-white bg-destructive rounded-md">
                {error}
              </div>
            )}
            
            {step === 1 && (
                <>
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-input rounded-md outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground placeholder:text-muted-foreground"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </div>
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-input rounded-md outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground placeholder:text-muted-foreground"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    </div>
                </>
            )}

            {step === 2 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Authenticator Code</label>
                    <input
                        type="text"
                        required
                        autoFocus
                        maxLength={6}
                        className="w-full px-3 py-2 border border-input rounded-md outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground placeholder:text-muted-foreground text-center text-2xl tracking-widest font-mono"
                        placeholder="000000"
                        value={totpToken}
                        onChange={(e) => setTotpToken(e.target.value)}
                    />
                </div>
            )}

            <Button className="w-full py-6 text-lg" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : (step === 1 ? 'Sign In' : 'Verify')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account? <span className="text-primary hover:underline cursor-pointer" onClick={() => navigate('/register')}>Register now</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
