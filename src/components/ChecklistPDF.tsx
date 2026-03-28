import React from "react";
import { ChecklistSalvo, ChecklistItem, ChecklistItemStatus } from "@/hooks/useChecklists";

interface ChecklistPDFProps {
  checklist: ChecklistSalvo;
  itens: ChecklistItem[];
  observacoes: string;
}

const statusLabel = (s: ChecklistItemStatus) => {
  if (s === "sim") return "✔ Sim";
  if (s === "nao") return "✘ Não";
  if (s === "nao_contem") return "— N/C";
  return "Pendente";
};

const statusColor = (s: ChecklistItemStatus) => {
  if (s === "sim") return "#16a34a";
  if (s === "nao") return "#dc2626";
  if (s === "nao_contem") return "#6b7280";
  return "#9ca3af";
};

const ChecklistPDF = React.forwardRef<HTMLDivElement, ChecklistPDFProps>(
  ({ checklist, itens, observacoes }, ref) => {
    const categorias = Array.from(new Set(itens.map(i => i.categoria)));

    return (
      <div
        ref={ref}
        style={{
          width: "794px",
          minHeight: "1123px",
          padding: "48px 56px",
          backgroundColor: "#ffffff",
          color: "#111111",
          fontSize: "13px",
          lineHeight: "1.5",
          boxSizing: "border-box",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img style={{ maxWidth: "400px", margin: "0 auto" }} src="/LM_Manutencao.png" alt="Logo" />
          <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "14px", textTransform: "uppercase" }}>
            CHECKLIST DE MANUTENÇÃO PREVENTIVA
          </div>
        </div>

        {/* Info */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "12px", borderBottom: "2px solid #16a34a", paddingBottom: "10px" }}>
          <div><strong>Cliente:</strong> {checklist.cliente_nome}</div>
          <div><strong>Técnico:</strong> {checklist.tecnico}</div>
          <div><strong>Data:</strong> {checklist.data_execucao}</div>
        </div>

        {/* Categories & Items */}
        {categorias.map(cat => (
          <div key={cat} style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#16a34a", marginBottom: "6px", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px" }}>
              {cat}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <tbody>
                {itens.filter(i => i.categoria === cat).map((item, idx) => (
                  <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f0fdf4" }}>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid #e5e7eb" }}>{item.descricao}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid #e5e7eb", width: "90px", textAlign: "center", fontWeight: 600, color: statusColor(item.status) }}>
                      {statusLabel(item.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Observations */}
        {observacoes && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>Observações:</div>
            <div style={{ fontSize: "12px", whiteSpace: "pre-wrap", color: "#374151" }}>{observacoes}</div>
          </div>
        )}

        {/* Signatures */}
        <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center", width: "45%" }}>
            <div style={{ borderTop: "1px solid #111", paddingTop: "6px", fontSize: "12px" }}>Técnico Responsável</div>
          </div>
          <div style={{ textAlign: "center", width: "45%" }}>
            <div style={{ borderTop: "1px solid #111", paddingTop: "6px", fontSize: "12px" }}>Cliente</div>
          </div>
        </div>
      </div>
    );
  }
);

ChecklistPDF.displayName = "ChecklistPDF";
export default ChecklistPDF;
