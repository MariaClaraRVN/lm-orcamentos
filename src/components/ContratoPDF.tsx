import React from "react";
import type { DadosContrato } from "@/pages/ContratoNovo";

interface ContratoPDFProps {
  dados: DadosContrato;
}

const pageStyle: React.CSSProperties = {
  width: "794px",
  minHeight: "1123px",
  padding: "48px 56px",
  backgroundColor: "#ffffff",
  color: "#111111",
  fontSize: "12.5px",
  lineHeight: "1.6",
  boxSizing: "border-box",
  fontFamily: "'Montserrat', sans-serif",
  position: "relative",
};

const titleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  textAlign: "center",
  marginBottom: "4px",
  textTransform: "uppercase",
};

const clausulaTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  marginTop: "14px",
  marginBottom: "4px",
};

const subItem: React.CSSProperties = {
  marginLeft: "16px",
  marginBottom: "2px",
};

const field = (value: string, placeholder: string) =>
  value?.trim() ? value : `[${placeholder}]`;

const ContratoPDF = React.forwardRef<HTMLDivElement, ContratoPDFProps>(
  ({ dados }, ref) => {
    const d = dados;

    return (
      <div ref={ref} style={{ display: "none" }}>
        {/* PAGE 1 */}
        <div data-page="1" style={pageStyle}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <img src="/LM_Manutencao.png" alt="Logo" style={{ maxWidth: "360px", margin: "0 auto" }} />
          </div>

          <div style={titleStyle}>CONTRATO DE MANUTENÇÃO</div>
          <div style={{ ...titleStyle, marginBottom: "18px" }}>PREVENTIVA DE GERADOR</div>

          <p style={{ textAlign: "justify", marginBottom: "12px" }}>
            Pelo presente instrumento particular de contrato de prestação de serviços de manutenção preventiva de grupo gerador, de um lado <strong>{field(d.contratadaRazaoSocial, "RAZÃO SOCIAL DA CONTRATADA")}</strong>, inscrita no CNPJ sob o nº <strong>{field(d.contratadaCnpj, "CNPJ DA CONTRATADA")}</strong>, estabelecida à {field(d.contratadaEndereco, "ENDEREÇO COMPLETO DA CONTRATADA")}, doravante denominada <strong>CONTRATADA</strong>, e, de outro lado, <strong>{field(d.contratanteRazaoSocial, "RAZÃO SOCIAL DA CONTRATANTE")}</strong>, inscrita no CNPJ sob o nº <strong>{field(d.contratanteCnpj, "CNPJ DA CONTRATANTE")}</strong>, estabelecida à {field(d.contratanteEndereco, "ENDEREÇO COMPLETO DA CONTRATANTE")}, doravante denominada <strong>CONTRATANTE</strong>, têm entre si justo e contratado o que segue:
          </p>

          <div style={clausulaTitle}>CLÁUSULA PRIMEIRA – OBJETO</div>
          <p style={{ textAlign: "justify" }}>
            1.1. O presente contrato tem por objeto a prestação de serviços de manutenção preventiva em grupo gerador da marca e modelo: <strong>{field(d.equipamentoDescricao, "MARCA / MODELO / ESPECIFICAÇÃO DO EQUIPAMENTO")}</strong>.
          </p>
          <p style={{ textAlign: "justify" }}>
            1.2. O presente contrato é exclusivo para o equipamento acima identificado. Qualquer outro equipamento deverá ser objeto de contrato específico.
          </p>

          <div style={clausulaTitle}>CLÁUSULA SEGUNDA – COBERTURA</div>
          <p style={{ textAlign: "justify" }}>
            2.1. Este contrato inclui a realização de manutenção preventiva mensal, conforme escopo descrito na Cláusula Terceira, e, a cada 06 (seis) meses, o fornecimento e substituição, por conta da CONTRATADA, dos seguintes itens:
          </p>
          <div style={subItem}>• Filtro de ar</div>
          <div style={subItem}>• Filtro de óleo lubrificante</div>
          <div style={subItem}>• Filtro de combustível (diesel e racor)</div>
          <div style={subItem}>• Óleo lubrificante do motor diesel</div>
          <p style={{ textAlign: "justify", marginTop: "6px" }}>
            2.2. Os itens acima serão fornecidos e substituídos uma única vez a cada 06 (seis) meses durante a vigência contratual.
          </p>
          <p style={{ textAlign: "justify" }}>
            2.3. Qualquer substituição fora do período estabelecido, bem como peças, componentes, fluidos ou serviços não expressamente previstos nesta cláusula, não estão cobertos pelo contrato e dependerão de orçamento prévio e aprovação da CONTRATANTE.
          </p>

          <div style={clausulaTitle}>CLÁUSULA TERCEIRA – ESCOPO DO SERVIÇO DE MANUTENÇÃO PREVENTIVA</div>
          <p style={{ textAlign: "justify", marginBottom: "6px" }}>
            A manutenção preventiva compreende os seguintes serviços (procedimentos técnicos descritos em anexo):
          </p>

          <div style={{ fontWeight: 600, marginTop: "6px" }}>I. Alimentação de Combustível:</div>
          <div style={subItem}>Avaliação dos tanques e nível de combustível; Verificação de vazamentos e obstruções; Drenagem de água e impurezas; Controle da quantidade e condições dos filtros.</div>

          <div style={{ fontWeight: 600, marginTop: "6px" }}>II. Bomba Injetora e Bicos Injetores:</div>
          <div style={subItem}>Verificações de fixações, vazamentos e reapertos; Avaliação da necessidade de calibração; Limpeza de pré-filtro da bomba alimentadora.</div>

          <div style={{ fontWeight: 600, marginTop: "6px" }}>III. Motores e Óleo Lubrificante:</div>
          <div style={subItem}>Verificação e controle de nível, viscosidade e temperatura do óleo; Identificação da necessidade de substituição do óleo e elementos filtrantes.</div>

          <div style={{ fontWeight: 600, marginTop: "6px" }}>IV. Sistema de Refrigeração:</div>
          <div style={subItem}>Avaliação do nível de água, mangueiras, colmeias, vazamentos, aditivo e bomba d'água; Verificação de correias, grades de proteção e ventiladores.</div>
        </div>

        {/* PAGE 2 */}
        <div data-page="2" style={pageStyle}>
          <div style={{ fontWeight: 600, marginTop: "6px" }}>V. Filtro de Ar e Turbinas:</div>
          <div style={subItem}>Verificação de conservação e restrição dos filtros; Avaliação do turbo compressor, folgas e vazamentos.</div>

          <div style={{ fontWeight: 600, marginTop: "6px" }}>VI. Pré-aquecimento, Baterias e Alternadores:</div>
          <div style={subItem}>Inspeção elétrica, resistência, conexões, tensão e corrente.</div>

          <div style={{ fontWeight: 600, marginTop: "6px" }}>VII. Reguladores e Sensores:</div>
          <div style={subItem}>Ajustes e testes de sensores magnéticos e reguladores de velocidade.</div>

          <div style={{ fontWeight: 600, marginTop: "6px" }}>VIII. Alternador Principal e Regulador de Tensão:</div>
          <div style={subItem}>Limpeza, aperto de terminais, lubrificação e medições conforme normas do fabricante.</div>

          <div style={{ fontWeight: 600, marginTop: "6px" }}>IX. Sistema de Controle, Alarmes e Proteções:</div>
          <div style={subItem}>Simulações elétricas, verificações de sensores, lógicas de controle e integridade dos cabos.</div>

          <div style={{ fontWeight: 600, marginTop: "6px" }}>X. Sistema de Partida Elétrica e Verificações Gerais:</div>
          <div style={subItem}>Avaliação do motor de partida, bateria, vibrações, ruídos, instrumentos, correias, polias e temperatura.</div>

          <div style={clausulaTitle}>CLÁUSULA QUARTA – PERIODICIDADE E AGENDAMENTO</div>
          <p style={{ textAlign: "justify" }}>
            4.1. A CONTRATANTE terá direito a 01 (um) atendimento mensal, mediante agendamento prévio em horário comercial (09h00 às 18h00), de segunda a sexta-feira, exceto feriados.
          </p>
          <p style={{ textAlign: "justify" }}>
            4.2. Os chamados não são cumulativos, ou seja, não utilizados em determinado mês não poderão ser acumulados para os meses seguintes.
          </p>

          <div style={clausulaTitle}>CLÁUSULA QUINTA – CHAMADOS DE EMERGÊNCIA</div>
          <p style={{ textAlign: "justify" }}>
            5.1. Chamados de emergência poderão ser solicitados a qualquer tempo, com prazo máximo de até 03 (três) horas para envio de técnico, contados a partir da abertura do chamado.
          </p>
          <p style={{ textAlign: "justify" }}>
            5.2. Chamados de emergência não substituem o atendimento mensal previsto na Cláusula Quarta.
          </p>
          <p style={{ textAlign: "justify" }}>
            5.3. Cada chamado emergencial estará sujeito à cobrança adicional de visita técnica, no valor de <strong>{field(d.valorVisitaEmergencia, "VALOR POR HORA OU VISITA")}</strong>, mediante aprovação prévia da CONTRATANTE.
          </p>
          <p style={{ textAlign: "justify" }}>
            5.4. Caso o atendimento emergencial resulte em necessidade de peças, serviços corretivos ou deslocamentos adicionais, estes serão cobrados à parte, mediante orçamento.
          </p>

          <div style={clausulaTitle}>CLÁUSULA SEXTA – VALOR E PAGAMENTO</div>
          <p style={{ textAlign: "justify" }}>
            6.1. Pela execução dos serviços, a CONTRATANTE pagará à CONTRATADA o valor mensal de <strong>{field(d.valorMensal, "VALOR MENSAL")}</strong>.
          </p>
          <p style={{ textAlign: "justify" }}>
            6.2. O presente contrato terá duração de 12 (doze) meses.
          </p>
          <p style={{ textAlign: "justify" }}>
            6.3. O pagamento deverá ser efetuado mensalmente, conforme condições acordadas entre as partes.
          </p>

          <div style={clausulaTitle}>CLÁUSULA SÉTIMA – VIGÊNCIA</div>
          <p style={{ textAlign: "justify" }}>
            7.1. O presente contrato vigorará pelo prazo de 12 (doze) meses, contados a partir da data de sua assinatura.
          </p>
          <p style={{ textAlign: "justify" }}>
            7.2. Os valores poderão ser reajustados anualmente.
          </p>

          <div style={clausulaTitle}>CLÁUSULA OITAVA – RESCISÃO</div>
          <p style={{ textAlign: "justify" }}>
            8.1. O contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio por escrito de 30 (trinta) dias.
          </p>
        </div>

        {/* PAGE 3 */}
        <div data-page="3" style={pageStyle}>
          <div style={clausulaTitle}>CLÁUSULA NONA – RESPONSABILIDADES E LIMITAÇÕES</div>
          <p style={{ textAlign: "justify" }}>
            9.1. A CONTRATADA não se responsabiliza por falhas, danos ou paralisações decorrentes de:
          </p>
          <div style={subItem}>• Mau uso do equipamento</div>
          <div style={subItem}>• Falta ou má qualidade do combustível</div>
          <div style={subItem}>• Sobrecarga elétrica</div>
          <div style={subItem}>• Intervenções de terceiros não autorizados</div>
          <div style={subItem}>• Ausência de manutenção corretiva não coberta pelo contrato</div>
          <p style={{ textAlign: "justify", marginTop: "6px" }}>
            9.2. A CONTRATADA não se responsabiliza por lucros cessantes, danos indiretos ou prejuízos decorrentes da indisponibilidade do equipamento.
          </p>
          <p style={{ textAlign: "justify" }}>
            9.3. A responsabilidade da CONTRATADA limita-se à execução correta dos serviços contratados.
          </p>

          <div style={clausulaTitle}>CLÁUSULA DÉCIMA – EQUIPAMENTO EM OFICINA E COBRANÇA DE ALUGUEL</div>
          <p style={{ textAlign: "justify" }}>
            10.1. Caso o equipamento seja removido para a oficina da CONTRATADA para manutenção corretiva ou reparo, a CONTRATANTE deverá providenciar sua retirada no prazo máximo de 30 (trinta) dias, contados da data de comunicação de conclusão do serviço.
          </p>
          <p style={{ textAlign: "justify" }}>
            10.2. Ultrapassado o prazo de 30 (trinta) dias sem a retirada do equipamento, será cobrada taxa mensal de aluguel/armazenagem, em valor a ser informado previamente, até a efetiva retirada do bem.
          </p>

          <div style={clausulaTitle}>CLÁUSULA DÉCIMA PRIMEIRA – DISPOSIÇÕES GERAIS</div>
          <p style={{ textAlign: "justify" }}>
            11.1. Todos os atendimentos deverão ser registrados em relatórios técnicos, devidamente assinados pelas partes.
          </p>
          <p style={{ textAlign: "justify" }}>
            11.2. O presente contrato não estabelece vínculo trabalhista entre a CONTRATANTE e os funcionários da CONTRATADA.
          </p>

          {/* Assinatura */}
          <div style={{ marginTop: "60px", textAlign: "center" }}>
            <p style={{ fontWeight: 600 }}>
              {field(d.cidade, "CIDADE")}, {field(d.dataContrato, "DATA")}.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "80px", gap: "40px" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #333", paddingTop: "8px", fontWeight: 600, fontSize: "12px" }}>
                CONTRATADA
              </div>
              <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
                {field(d.contratadaRazaoSocial, "Razão Social")}
              </div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #333", paddingTop: "8px", fontWeight: 600, fontSize: "12px" }}>
                CONTRATANTE
              </div>
              <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
                {field(d.contratanteRazaoSocial, "Razão Social")}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ContratoPDF.displayName = "ContratoPDF";
export default ContratoPDF;
