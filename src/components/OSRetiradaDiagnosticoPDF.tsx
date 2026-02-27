import React from "react";
import type { OrdemServico, Diagnostico, MidiaOS } from "@/hooks/useOrdensServico";

interface Props {
  os: OrdemServico;
  diagnostico: Diagnostico | null;
  midias: MidiaOS[];
}

const OSRetiradaDiagnosticoPDF = React.forwardRef<HTMLDivElement, Props>(
  ({ os, diagnostico, midias }, ref) => {
    const isPF = os.tipo_pessoa === "fisica";
    const nome = isPF ? os.cliente_nome_pessoa : os.cliente_nome;
    const midiasRetirada = midias.filter((m) => m.etapa === "retirada");
    const midiasDiag = midias.filter((m) => m.etapa === "diagnostico");

    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
      <div style={{ backgroundColor: "#16a34a", color: "#fff", padding: "6px 12px", fontWeight: 700, fontSize: "13px", marginTop: "18px", marginBottom: "8px" }}>
        {children}
      </div>
    );

    const Row = ({ label, value }: { label: string; value: string | number | null | undefined }) =>
      value ? (
        <div style={{ display: "flex", gap: "8px", fontSize: "12px", padding: "2px 0" }}>
          <span style={{ fontWeight: 700, minWidth: "120px", color: "#555" }}>{label}:</span>
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
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <img style={{ maxWidth: "360px", margin: "0 auto" }} src="/LM_Manutencao.png" alt="Logo" />
          <div style={{ fontSize: "16px", fontWeight: 800, marginTop: "10px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>
            RELATÓRIO DE RETIRADA E DIAGNÓSTICO
          </div>
          <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
            OS: {os.numero} — Data: {os.data_retirada || new Date(os.created_at).toLocaleDateString("pt-BR")}
          </div>
        </div>

        {/* RETIRADA */}
        <SectionTitle>📄 RELATÓRIO DE RETIRADA DE MÁQUINA</SectionTitle>

        <div style={{ fontWeight: 700, fontSize: "11px", color: "#16a34a", marginBottom: "4px", textTransform: "uppercase" }}>Dados do Cliente</div>
        <Row label="Nome / Razão Social" value={nome} />
        <Row label={isPF ? "CPF" : "CNPJ"} value={isPF ? os.cliente_cpf : os.cliente_cnpj} />
        <Row label="Endereço" value={os.cliente_endereco} />
        <Row label="Email" value={os.cliente_email} />
        <Row label="Telefone" value={os.cliente_telefone} />

        <div style={{ fontWeight: 700, fontSize: "11px", color: "#16a34a", marginTop: "12px", marginBottom: "4px", textTransform: "uppercase" }}>Dados da Máquina</div>
        <Row label="Tipo" value={os.tipo_maquina === "gerador" ? "Gerador" : "Compressor"} />
        <Row label="Marca" value={os.marca} />
        <Row label="Modelo" value={os.modelo} />
        <Row label="Nº Série" value={os.numero_serie} />
        <Row label="Horímetro" value={os.horimetro} />
        <Row label="Potência" value={os.potencia} />
        <Row label="Tensão" value={os.tensao} />
        <Row label="Estado Geral" value={os.estado_geral} />
        <Row label="Acessórios" value={os.acessorios_entregues} />

        <div style={{ fontWeight: 700, fontSize: "11px", color: "#16a34a", marginTop: "12px", marginBottom: "4px", textTransform: "uppercase" }}>Dados da Retirada</div>
        <Row label="Data" value={os.data_retirada} />
        <Row label="Hora" value={os.hora_retirada} />
        <Row label="Local" value={os.local_coleta} />
        <Row label="Responsável" value={os.responsavel_retirada} />
        <Row label="Placa Veículo" value={os.placa_veiculo} />
        <Row label="Defeito Relatado" value={os.defeito_relatado} />

        {midiasRetirada.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
            {midiasRetirada.filter((m) => m.tipo === "foto").map((m) => (
              <img key={m.id} src={m.url} alt="" style={{ width: "100px", height: "75px", objectFit: "cover", border: "1px solid #ddd" }} />
            ))}
          </div>
        )}

        {os.clausula_permanencia && (
          <div style={{ marginTop: "12px", padding: "8px 12px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", fontSize: "10px", fontStyle: "italic", color: "#555" }}>
            <strong>Cláusula de Permanência:</strong> {os.clausula_permanencia}
          </div>
        )}

        {/* DIAGNÓSTICO */}
        <SectionTitle>🔍 RELATÓRIO DE DIAGNÓSTICO / TESTE</SectionTitle>

        {diagnostico ? (
          <>
            <Row label="Técnico" value={diagnostico.tecnico_responsavel} />
            <Row label="Data do Teste" value={diagnostico.data_teste} />
            <Row label="Problema" value={diagnostico.problema_identificado} />
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
          </>
        ) : (
          <div style={{ color: "#999", fontStyle: "italic", fontSize: "11px" }}>Diagnóstico ainda não registrado.</div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "40px", borderTop: "1px solid #e5e7eb", paddingTop: "12px", textAlign: "center", fontSize: "10px", color: "#999" }}>
          LM Manutenções — Geradores e Compressores — {os.numero}
        </div>
      </div>
    );
  }
);

OSRetiradaDiagnosticoPDF.displayName = "OSRetiradaDiagnosticoPDF";
export default OSRetiradaDiagnosticoPDF;
