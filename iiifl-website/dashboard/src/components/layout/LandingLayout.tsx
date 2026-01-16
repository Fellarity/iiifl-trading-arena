import { useNavigate, Outlet } from "react-router-dom";
import { Button } from "../ui/button";
import { ModeToggle } from "../ui/mode-toggle";

const LandingLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary tracking-tighter cursor-pointer" onClick={() => navigate("/")}>
            iiifl
          </div>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <button onClick={() => navigate("/products")} className="hover:text-foreground transition-colors">Products</button>
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">Pricing</button>
            <button onClick={() => navigate("/learn")} className="hover:text-foreground transition-colors">Learn</button>
          </div>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button variant="ghost" onClick={() => navigate("/login")}>Log in</Button>
            <Button onClick={() => navigate("/login")}>Open Account</Button>
          </div>
        </div>
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
