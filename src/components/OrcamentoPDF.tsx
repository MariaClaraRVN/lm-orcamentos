import React from "react";

export interface ItemOrcamento {
  id: string;
  quantidade: number;
  descricao: string;
  valorUnitario: number;
  valorTotal?: number;
}

export interface DadosOrcamento {
  numero: string;
  data: string;
  clienteNome: string;
  clienteCnpj: string;
  clienteEndereco?: string;
  clienteCpf?: string;
  clienteNomePessoa?: string;
  tipoPessoa?: "juridica" | "fisica";
  itens: ItemOrcamento[];
  observacoes?: string;
}

interface OrcamentoPDFProps {
  dados: DadosOrcamento;
}

const formatMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const OrcamentoPDF = React.forwardRef<HTMLDivElement, OrcamentoPDFProps>(
  ({ dados }, ref) => {
    const total = dados.itens.reduce(
      (acc, item) => acc + (item.valorTotal ?? item.quantidade * item.valorUnitario),
      0
    );

    const isPF = dados.tipoPessoa === "fisica";

    return (
      <div
        ref={ref}
        id="orcamento-pdf"
        style={{
          width: "794px",
          minHeight: "1123px",
          padding: "48px 56px",
          backgroundColor: "#ffffff",
          color: "#111111",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "13px",
          lineHeight: "1.5",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "32px",
              fontWeight: "900",
              letterSpacing: "1px",
              marginBottom: "6px",
            }}
          >
            <span style={{ color: "#111111" }}>L</span>
            <span style={{ color: "#16a34a", fontSize: "36px" }}>⚡</span>
            <span style={{ color: "#16a34a" }}>M MANUTENÇÕES</span>
          </div>
          <div style={{ fontSize: "12px", color: "#111111", lineHeight: "1.8" }}>
            <div>📱 (11) 9. 4554-7975</div>
            <div>
              <strong>CNPJ: 40.080.991/0001-84</strong>
            </div>
            <div>LINCOLN.MANUTENCOES@GMAIL.COM</div>
            <div>LINCOLN.VIANNA@BOL.COM.BR</div>
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "800",
              marginTop: "14px",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            ORÇAMENTO COMERCIAL
          </div>
        </div>

        {/* Divider + Date */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
            fontSize: "12px",
          }}
        >
          <span>Data: {dados.data}</span>
        </div>

        {/* Client Data */}
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              color: "#16a34a",
              fontWeight: "700",
              fontSize: "14px",
              marginBottom: "8px",
            }}
          >
            Dados do Cliente
          </div>
          <div
            style={{
              display: "flex",
              gap: "40px",
              flexWrap: "wrap",
              fontSize: "13px",
            }}
          >
            {isPF ? (
              <>
                <span>
                  <strong>Nome:</strong> {dados.clienteNomePessoa || "—"}
                </span>
                <span>
                  <strong>CPF:</strong> {dados.clienteCpf || "—"}
                </span>
              </>
            ) : (
              <>
                <span>
                  <strong>Empresa:</strong> {dados.clienteNome || "—"}
                </span>
                <span>
                  <strong>CNPJ:</strong> {dados.clienteCnpj || "—"}
                </span>
              </>
            )}
          </div>
          {dados.clienteEndereco && (
            <div style={{ marginTop: "4px" }}>
              <strong>Endereço:</strong> {dados.clienteEndereco}
            </div>
          )}
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              color: "#16a34a",
              fontWeight: "700",
              fontSize: "14px",
              marginBottom: "8px",
            }}
          >
            Itens do Orçamento
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                }}
              >
                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    fontWeight: "700",
                    width: "60px",
                  }}
                >
                  Qtd
                </th>
                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    fontWeight: "700",
                  }}
                >
                  Descrição
                </th>
                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "right",
                    fontWeight: "700",
                    width: "130px",
                  }}
                >
                  Valor Unit. (R$)
                </th>
                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "right",
                    fontWeight: "700",
                    width: "130px",
                  }}
                >
                  Valor Total (R$)
                </th>
              </tr>
            </thead>
            <tbody>
              {dados.itens.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f0fdf4",
                  }}
                >
                  <td
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {item.quantidade}
                  </td>
                  <td
                    style={{
                      padding: "7px 12px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {item.descricao}
                  </td>
                  <td
                    style={{
                      padding: "7px 12px",
                      textAlign: "right",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {item.valorUnitario > 0 ? formatMoeda(item.valorUnitario) : "—"}
                  </td>
                  <td
                    style={{
                      padding: "7px 12px",
                      textAlign: "right",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {(item.valorTotal ?? (item.valorUnitario > 0 ? item.quantidade * item.valorUnitario : 0)) > 0
                      ? formatMoeda(item.valorTotal ?? item.quantidade * item.valorUnitario)
                      : "—"}
                  </td>
                </tr>
              ))}
              {dados.itens.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#9ca3af",
                      fontStyle: "italic",
                    }}
                  >
                    Nenhum item adicionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total */}
          {total > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "12px",
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              Total: {formatMoeda(total)}
            </div>
          )}
        </div>

        {/* Observations */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              color: "#111111",
              fontWeight: "700",
              fontSize: "14px",
              marginBottom: "6px",
            }}
          >
            Observações:
          </div>
          <div style={{ color: "#16a34a", lineHeight: "2" }}>
            <div>Garantia: 90 dias</div>
            <div>Execução: até 3 dias úteis após depósito inicial</div>
            <div>Necessário entrada de 50% e restante ao final do serviço</div>
            {dados.observacoes && <div>{dados.observacoes}</div>}
          </div>
        </div>

        {/* Payment */}
        <div>
          <div
            style={{
              color: "#111111",
              fontWeight: "700",
              fontSize: "14px",
              marginBottom: "6px",
            }}
          >
            Pagamento:
          </div>
          <div style={{ color: "#16a34a", lineHeight: "2" }}>
            <div>
              Deposito banco Nubank: 260 - Agência: 0001 - Conta: 56310862-1
            </div>
            <div>Pix CNPJ: 40080991000184</div>
            <div>Este orçamento tem validade de 15 dias</div>
          </div>
        </div>
      </div>
    );
  }
);

OrcamentoPDF.displayName = "OrcamentoPDF";

export default OrcamentoPDF;
