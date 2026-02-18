import { useEffect, useState } from "react";
import { listarOrcamentos, OrcamentoSalvo } from "@/hooks/useOrcamentos";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Calendar, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatMoeda = (valor: number) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Historico() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoSalvo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarOrcamentos().then((list) => {
      setOrcamentos(list);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="bg-[hsl(var(--brand-black))] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-2xl tracking-wide">L</span>
            <span className="text-[hsl(var(--brand-green-light))] font-black text-2xl">⚡M MANUTENÇÕES</span>
          </div>
          <span className="text-sm text-gray-400 hidden sm:block">Histórico de Orçamentos</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Histórico de Orçamentos</h1>
          <Link to="/">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <ArrowLeft size={16} className="mr-2" />
              Novo Orçamento
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Carregando...</div>
        ) : orcamentos.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg">Nenhum orçamento gerado ainda.</p>
            <Link to="/">
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                Criar primeiro orçamento
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="bg-primary px-6 py-3">
              <h2 className="text-primary-foreground font-bold text-base">
                {orcamentos.length} orçamento{orcamentos.length !== 1 ? "s" : ""} gerado{orcamentos.length !== 1 ? "s" : ""}
              </h2>
            </div>
            <div className="divide-y divide-border">
              {orcamentos.map((orc, idx) => (
                <div
                  key={orc.id}
                  className={`p-4 ${idx % 2 === 0 ? "bg-card" : "bg-[hsl(var(--table-row-alt))]"}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        <span className="font-bold text-foreground">
                          Orçamento #{orc.numero}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User size={13} />
                          {orc.cliente_nome || "Cliente não informado"}
                        </span>
                        {orc.cliente_cnpj && (
                          <span>CNPJ: {orc.cliente_cnpj}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {orc.data}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                          <DollarSign size={16} className="text-primary" />
                          {formatMoeda(orc.total)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(orc.created_at).toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  </div>
                  {orc.observacoes && (
                    <p className="mt-2 text-xs text-muted-foreground italic truncate">
                      Obs: {orc.observacoes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 bg-[hsl(var(--brand-black))] text-gray-400 text-xs text-center py-4">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Orçamentos
      </footer>
    </div>
  );
}
