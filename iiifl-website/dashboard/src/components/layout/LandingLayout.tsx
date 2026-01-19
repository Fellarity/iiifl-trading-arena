import { useNavigate, Outlet } from "react-router-dom";
import { Button } from "../ui/button";
import { ModeToggle } from "../ui/mode-toggle";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const LandingLayout = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary tracking-tighter cursor-pointer" onClick={() => navigate("/")}>
            iiifl
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <button onClick={() => navigate("/products")} className="hover:text-foreground transition-colors">Products</button>
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">Pricing</button>
            <button onClick={() => navigate("/learn")} className="hover:text-foreground transition-colors">Learn</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
            <Button variant="ghost" onClick={() => navigate("/login")}>Log in</Button>
            <Button onClick={() => navigate("/login")}>Open Account</Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
             <ModeToggle />
             <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                 {isMenuOpen ? <X /> : <Menu />}
             </button>
          </div>
        </div>

        {/* Mobile Nav Content */}
        {isMenuOpen && (
            <div className="md:hidden border-t border-border bg-background p-4 space-y-4 shadow-lg animate-in slide-in-from-top-5 duration-200">
                <div className="flex flex-col gap-4 text-sm font-medium">
                    <button onClick={() => { navigate("/products"); setIsMenuOpen(false); }} className="text-left py-2 hover:text-primary">Products</button>
                    <button onClick={() => { navigate("/pricing"); setIsMenuOpen(false); }} className="text-left py-2 hover:text-primary">Pricing</button>
                    <button onClick={() => { navigate("/learn"); setIsMenuOpen(false); }} className="text-left py-2 hover:text-primary">Learn</button>
                </div>
                <div className="grid gap-2 pt-4 border-t border-border">
                    <Button variant="outline" onClick={() => navigate("/login")} className="w-full">Log in</Button>
                    <Button onClick={() => navigate("/register")} className="w-full">Open Account</Button>
                </div>
            </div>
        )}
      </nav>

      {/* Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="py-12 text-center text-muted-foreground border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-left mb-10">
            <div>
                <h4 className="font-bold text-foreground mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                    <li>About Us</li>
                    <li>Careers</li>
                    <li>Contact</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-foreground mb-4">Products</h4>
                <ul className="space-y-2 text-sm">
                    <li>Pro Terminal</li>
                    <li>Mobile App</li>
                    <li>API</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-foreground mb-4">Support</h4>
                <ul className="space-y-2 text-sm">
                    <li>Help Center</li>
                    <li>Status</li>
                    <li>Security</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-foreground mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                    <li>Terms</li>
                    <li>Privacy</li>
                    <li>Risk Disclosure</li>
                </ul>
            </div>
        </div>
        <p className="text-sm">© 2026 iiifl Securities. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingLayout;
