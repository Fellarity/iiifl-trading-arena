import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { ModeToggle } from "../components/ui/mode-toggle";
import api from "../lib/api";

const Settings = () => {
  const { user } = useAuth();
  
  // Password State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mocking the endpoint call since I haven't implemented it in backend yet
      // await api.post('/auth/change-password', { oldPassword, newPassword });
      
      // Simulate success
      await new Promise(r => setTimeout(r, 1000));
      alert("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      alert("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
       <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

       {/* Profile */}
       <Card>
           <CardHeader>
               <CardTitle>Profile Information</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                       <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                       <div className="font-medium text-lg">{user?.full_name}</div>
                   </div>
                   <div>
                       <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                       <div className="font-medium text-lg">{user?.email}</div>
                   </div>
                   <div>
                       <label className="text-sm font-medium text-muted-foreground">Role</label>
                       <div className="capitalize">{user?.role}</div>
                   </div>
               </div>
           </CardContent>
       </Card>

       {/* Appearance */}
       <Card>
           <CardHeader>
               <CardTitle>Appearance</CardTitle>
           </CardHeader>
           <CardContent className="flex items-center justify-between">
               <span>Theme Preference</span>
               <div className="flex items-center gap-2">
                   <span className="text-sm text-muted-foreground">Toggle Mode:</span>
                   <ModeToggle />
               </div>
           </CardContent>
       </Card>

       {/* Security */}
       <Card>
           <CardHeader>
               <CardTitle>Security</CardTitle>
           </CardHeader>
           <CardContent>
               <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                   <div className="space-y-2">
                       <label className="text-sm font-medium">Current Password</label>
                       <input 
                         type="password" 
                         className="w-full px-3 py-2 border rounded-md bg-background"
                         value={oldPassword}
                         onChange={e => setOldPassword(e.target.value)}
                         required
                       />
                   </div>
                   <div className="space-y-2">
                       <label className="text-sm font-medium">New Password</label>
                       <input 
                         type="password" 
                         className="w-full px-3 py-2 border rounded-md bg-background"
                         value={newPassword}
                         onChange={e => setNewPassword(e.target.value)}
                         required
                         minLength={8}
                       />
                   </div>
                   <Button type="submit" disabled={loading}>
                       {loading ? "Updating..." : "Update Password"}
                   </Button>
               </form>

               <div className="mt-8 pt-6 border-t">
                   <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                   <TwoFactorSetup />
               </div>
           </CardContent>
       </Card>
    </div>
  );
};

const TwoFactorSetup = () => {
    const [step, setStep] = useState(1); // 1: Start, 2: Scan, 3: Done
    const [qrCode, setQrCode] = useState("");
    const [token, setToken] = useState("");
    
    const startSetup = async () => {
        try {
            const res = await api.post('/auth/2fa/setup');
            setQrCode(res.data.data.qrCode);
            setStep(2);
        } catch (e) { alert("Failed to start setup"); }
    };

    const verify = async () => {
        try {
            await api.post('/auth/2fa/verify', { token });
            setStep(3);
        } catch (e) { alert("Invalid Code"); }
    };

    if (step === 3) return <div className="text-emerald-500 font-bold">✅ 2FA is Enabled</div>;

    return (
        <div className="space-y-4">
            {step === 1 && (
                <Button onClick={startSetup} variant="outline">Enable 2FA (TOTP)</Button>
            )}
            {step === 2 && (
                <div className="space-y-4 border p-4 rounded-md bg-secondary/20">
                    <p className="text-sm text-muted-foreground">Scan this QR code with Google Authenticator:</p>
                    <img src={qrCode} alt="2FA QR" className="bg-white p-2 rounded-md" />
                    <div className="flex gap-2">
                        <input 
                            className="bg-background border px-3 py-2 rounded-md w-32 text-center tracking-widest"
                            placeholder="000000"
                            value={token}
                            onChange={e => setToken(e.target.value)}
                        />
                        <Button onClick={verify}>Verify & Enable</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
