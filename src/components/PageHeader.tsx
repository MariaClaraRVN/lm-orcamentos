import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  titulo?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ titulo, children }: PageHeaderProps) {
  return (
    <header className="bg-[hsl(var(--brand-black))] text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-3 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link to="/" className="shrink-0">
            <img className="h-8 sm:h-10 w-auto" src="/Icon.png" alt="Logo LM" />
          </Link>
          {titulo && (
            <span className="text-xs sm:text-sm text-gray-400 truncate hidden sm:block">{titulo}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
          {children}
          <Link to="/">
            <Button variant="outline" size="sm" className="border-[hsl(var(--brand-green-light))] text-[hsl(var(--brand-green-light))] hover:bg-[hsl(var(--brand-green-light))] hover:text-[hsl(var(--brand-black))] text-xs px-2 sm:px-3">
              <Home size={14} className="mr-1" />
              <span className="hidden xs:inline">Menu</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
