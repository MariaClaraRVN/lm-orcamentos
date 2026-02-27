import React from "react";
import type { OrdemServico, Conclusao, MidiaOS } from "@/hooks/useOrdensServico";

interface Props {
  os: OrdemServico;
  conclusao: Conclusao;
  midias: MidiaOS[];
}

const formatMoeda = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const OSConclusaoPDF = React.forwardRef<HTMLDivElement, Props>(
  ({ os, conclusao, midias }, ref) => {
    const isPF = os.tipo_pessoa === "fisica";
    const nome = isPF ? os.cliente_nome_pessoa : os.cliente_nome;
    const midiasConclusao = midias.filter((m) => m.etapa === "conclusao");

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
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <img style={{ maxWidth: "360px", margin: "0 auto" }} src="/LM_Manutencao.png" alt="Logo" />
          <div style={{ fontSize: "16px", fontWeight: 800, marginTop: "10px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>
            RELATÓRIO DE CONCLUSÃO / ENTREGA
          </div>
          <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
            OS: {os.numero} — Cliente: {nome || "—"}
          </div>
        </div>

        {/* Client summary */}
        <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", padding: "10px 14px", marginBottom: "16px", fontSize: "11px" }}>
          <div style={{ fontWeight: 700, marginBottom: "4px", color: "#16a34a", textTransform: "uppercase" }}>Dados do Cliente</div>
          <Row label="Nome / Razão Social" value={nome} />
          <Row label={isPF ? "CPF" : "CNPJ"} value={isPF ? os.cliente_cpf : os.cliente_cnpj} />
          <Row label="Endereço" value={os.cliente_endereco} />
          <Row label="Telefone" value={os.cliente_telefone} />
        </div>

        {/* Machine summary */}
        <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", padding: "10px 14px", marginBottom: "16px", fontSize: "11px" }}>
          <div style={{ fontWeight: 700, marginBottom: "4px", color: "#16a34a", textTransform: "uppercase" }}>Equipamento</div>
          <Row label="Tipo" value={os.tipo_maquina === "gerador" ? "Gerador" : "Compressor"} />
          <Row label="Marca / Modelo" value={`${os.marca} ${os.modelo}`.trim()} />
        </div>

        {/* Conclusão */}
        <div style={{ backgroundColor: "#16a34a", color: "#fff", padding: "6px 12px", fontWeight: 700, fontSize: "13px", marginBottom: "10px" }}>
          ✅ SERVIÇOS EXECUTADOS E ENTREGA
        </div>

        <Row label="Serviços Executados" value={conclusao.servicos_executados} />
        <Row label="Peças Substituídas" value={conclusao.pecas_substituidas} />
        
        <div style={{ display: "flex", gap: "8px", fontSize: "12px", padding: "2px 0" }}>
          <span style={{ fontWeight: 700, minWidth: "140px", color: "#555" }}>Valor Final:</span>
          <span style={{ fontWeight: 700, fontSize: "14px", color: "#16a34a" }}>{formatMoeda(conclusao.valor_final)}</span>
        </div>

        <Row label="Data da Conclusão" value={conclusao.data_conclusao} />
        <Row label="Data da Entrega" value={conclusao.data_entrega} />
        <Row label="Garantia" value={conclusao.garantia_meses > 0 ? `${conclusao.garantia_meses} meses` : undefined} />
        <Row label="Observações Finais" value={conclusao.observacoes_finais} />

        {midiasConclusao.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
            {midiasConclusao.filter((m) => m.tipo === "foto").map((m) => (
              <img key={m.id} src={m.url} alt="" style={{ width: "100px", height: "75px", objectFit: "cover", border: "1px solid #ddd" }} />
            ))}
          </div>
        )}

        {/* Assinatura */}
        <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center", width: "45%" }}>
            <div style={{ borderTop: "1px solid #333", paddingTop: "6px", fontSize: "11px" }}>
              Responsável Técnico
            </div>
          </div>
          <div style={{ textAlign: "center", width: "45%" }}>
            <div style={{ borderTop: "1px solid #333", paddingTop: "6px", fontSize: "11px" }}>
              Cliente — {nome || "_______________"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "40px", borderTop: "1px solid #e5e7eb", paddingTop: "12px", textAlign: "center", fontSize: "10px", color: "#999" }}>
          LM Manutenções — Geradores e Compressores — {os.numero}
        </div>
      </div>
    );
  }
);

OSConclusaoPDF.displayName = "OSConclusaoPDF";
export default OSConclusaoPDF;
