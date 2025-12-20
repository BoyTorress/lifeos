import { Link, useLocation } from "wouter";
import { LayoutDashboard, GraduationCap, Car, Settings, User, Dumbbell, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Resumen", icon: LayoutDashboard, href: "/" },
  { label: "Universidad", icon: GraduationCap, href: "/university" },
  { label: "Uber & Finanzas", icon: Car, href: "/uber" },
  { label: "Salud & Gym", icon: Dumbbell, href: "/health" },
  { label: "Ajustes", icon: Settings, href: "/settings" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
            B
          </div>
          <span className="font-mono">LifeOS_v1</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Ingeniería Civil Informática</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-accent/30">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Brandon</p>
            <p className="text-xs text-muted-foreground truncate">Estudiante & Driver</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-50">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-background/80 backdrop-blur z-40 flex items-center px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r border-sidebar-border bg-sidebar">
            <NavContent />
          </SheetContent>
        </Sheet>
        <span className="ml-2 font-mono font-bold">LifeOS</span>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="container max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
