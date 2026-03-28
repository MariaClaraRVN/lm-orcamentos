import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <img src="/LM_Manutencao.png" alt="Logo" className="mx-auto mb-4 max-w-[200px]" />
          <CardTitle className="text-lg">Acesso ao Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={loading} className="w-full py-5 font-bold">
              <LogIn size={18} className="mr-2" />
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
