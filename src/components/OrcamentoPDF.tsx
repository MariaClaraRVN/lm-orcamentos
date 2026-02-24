import React from "react";

export interface ItemOrcamento {
  id: string;
  quantidade: number;
  descricao: string;
  valorUnitario: number;
}

export interface DadosOrcamento {
  numero: string;
  data: string;
  clienteNome: string;
  clienteCnpj: string;
  clienteEndereco?: string;
  clienteCpf?: string;
  clienteNomePessoa?: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  tipoPessoa?: "juridica" | "fisica";
  marcaMaquina?: string;
  modeloMaquina?: string;
  itens: ItemOrcamento[];
  observacoes?: string;
  total?: number;
}

interface OrcamentoPDFProps {
  dados: DadosOrcamento;
}

const formatMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const OrcamentoPDF = React.forwardRef<HTMLDivElement, OrcamentoPDFProps>(
  ({ dados }, ref) => {
    const total = dados.total ?? 0;
    const hasValorUnitario = dados.itens.some((item) => item.valorUnitario > 0);

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
          fontSize: "13px",
          lineHeight: "1.5",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div>
            <img style={{maxWidth: "400px", margin: "0 auto"}} src="/LM_Manutencao.png" alt="Logo da LM Manutenções" />
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "800",
              marginTop: "14px",
              textTransform: "uppercase",
              fontFamily: "'Montserrat', sans-serif",
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
              color: "#111111",
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
          <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginTop: "4px", fontSize: "13px" }}>
            {dados.clienteEmail && (
              <span><strong>Email:</strong> {dados.clienteEmail}</span>
            )}
            {dados.clienteTelefone && (
              <span><strong>Telefone:</strong> {dados.clienteTelefone}</span>
            )}
          </div>
          {(dados.marcaMaquina || dados.modeloMaquina) && (
            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginTop: "4px", fontSize: "13px" }}>
              {dados.marcaMaquina && (
                <span><strong>Marca da Máquina:</strong> {dados.marcaMaquina}</span>
              )}
              {dados.modeloMaquina && (
                <span><strong>Modelo da Máquina:</strong> {dados.modeloMaquina}</span>
              )}
            </div>
          )}
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              color: "#111111",
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
                {hasValorUnitario && (
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
                )}
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
                  {hasValorUnitario && (
                    <td
                      style={{
                        padding: "7px 12px",
                        textAlign: "right",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {item.valorUnitario > 0 ? formatMoeda(item.valorUnitario) : "—"}
                    </td>
                  )}
                </tr>
              ))}
              {dados.itens.length === 0 && (
                <tr>
                  <td
                    colSpan={hasValorUnitario ? 3 : 2}
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
          <div style={{ color: "#111111", lineHeight: "2" }}>
            <div>Garantia: 90 dias</div>
            <div>Execução: até 3 dias úteis após depósito inicial</div>
            <div>Necessário entrada de 50% e restante ao final do serviço</div>
            {dados.observacoes && <div>Observações adicionais: {dados.observacoes}</div>}
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
          <div style={{ color: "#111111", lineHeight: "2" }}>
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
