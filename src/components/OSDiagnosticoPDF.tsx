import React from "react";
import type { OrdemServico, Diagnostico, MidiaOS } from "@/hooks/useOrdensServico";

interface Props {
  os: OrdemServico;
  diagnostico: Diagnostico;
  midias: MidiaOS[];
}

const OSDiagnosticoPDF = React.forwardRef<HTMLDivElement, Props>(
  ({ os, diagnostico, midias }, ref) => {
    const isPF = os.tipo_pessoa === "fisica";
    const nome = isPF ? os.cliente_nome_pessoa : os.cliente_nome;
    const midiasDiag = midias.filter((m) => m.etapa === "diagnostico");

    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
      <div style={{ backgroundColor: "#16a34a", color: "#fff", padding: "6px 12px", fontWeight: 700, fontSize: "13px", marginTop: "18px", marginBottom: "8px" }}>
        {children}
      </div>
    );

    const Row = ({ label, value }: { label: string; value: string | number | null | undefined }) =>
      value ? (
        <div style={{ display: "flex", gap: "8px", fontSize: "12px", padding: "2px 0" }}>
          <span style={{ fontWeight: 700, minWidth: "140px", color: "#555" }}>{label}:</span>
          <span>{value}</span>
        </div>
      ) : null;

    return (
      <div
        ref={ref}
        style={{
          width: "794px",
          minHeight: "1123px",
          padding: "40px 50px",
          backgroundColor: "#ffffff",
          color: "#111",
          fontSize: "12px",
          lineHeight: "1.6",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <img style={{ maxWidth: "360px", margin: "0 auto" }} src="/LM_Manutencao.png" alt="Logo" />
          <div style={{ fontSize: "16px", fontWeight: 800, marginTop: "10px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>
            RELATÓRIO DE DIAGNÓSTICO / TESTE
          </div>
          <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
            OS: {os.numero} — Cliente: {nome || "—"}
          </div>
        </div>

        {/* Resumo do equipamento */}
        <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", padding: "10px 14px", marginBottom: "16px", fontSize: "11px" }}>
          <div style={{ fontWeight: 700, marginBottom: "4px", color: "#16a34a", textTransform: "uppercase" }}>Equipamento</div>
          <Row label="Tipo" value={os.tipo_maquina === "gerador" ? "Gerador" : "Compressor"} />
          <Row label="Marca / Modelo" value={`${os.marca} ${os.modelo}`.trim()} />
        </div>

        <SectionTitle>🔍 DIAGNÓSTICO TÉCNICO</SectionTitle>
        <Row label="Técnico Responsável" value={diagnostico.tecnico_responsavel} />
        <Row label="Data do Teste" value={diagnostico.data_teste} />
        <Row label="Problema Identificado" value={diagnostico.problema_identificado} />
        <Row label="Peças Danificadas" value={diagnostico.pecas_danificadas} />
        <Row label="Causa Provável" value={diagnostico.causa_provavel} />
        <Row label="Testes Realizados" value={diagnostico.testes_realizados} />
        <Row label="Resultado Final" value={diagnostico.resultado_final} />
        <Row label="Observações" value={diagnostico.observacoes} />

        {midiasDiag.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
            {midiasDiag.filter((m) => m.tipo === "foto").map((m) => (
              <img key={m.id} src={m.url} alt="" style={{ width: "100px", height: "75px", objectFit: "cover", border: "1px solid #ddd" }} />
            ))}
          </div>
        )}

        <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center", width: "45%" }}>
            <div style={{ borderTop: "1px solid #333", paddingTop: "6px", fontSize: "11px" }}>Técnico Responsável</div>
          </div>
          <div style={{ textAlign: "center", width: "45%" }}>
            <div style={{ borderTop: "1px solid #333", paddingTop: "6px", fontSize: "11px" }}>Aprovação — {nome || "_______________"}</div>
          </div>
        </div>

        <div style={{ marginTop: "40px", borderTop: "1px solid #e5e7eb", paddingTop: "12px", textAlign: "center", fontSize: "10px", color: "#999" }}>
          LM Manutenções — Geradores e Compressores — {os.numero}
        </div>
      </div>
    );
  }
);

OSDiagnosticoPDF.displayName = "OSDiagnosticoPDF";
export default OSDiagnosticoPDF;
