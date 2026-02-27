

# Plataforma LM Manutencoes - Modulo de Ordem de Servico

## Resumo

Transformar o sistema atual de orcamentos em uma plataforma completa de gestao para oficina de geradores e compressores, adicionando um modulo independente de Ordem de Servico (OS) com fluxo completo: retirada, diagnostico, orcamento vinculado, execucao e entrega.

O modulo de Orcamento existente sera mantido separado e intacto.

---

## Fase 1 - Tela Inicial e Navegacao

Substituir a tela atual (que abre direto no formulario de orcamento) por uma tela inicial com:

- Botao "Novo Registro" que abre um dialogo para escolher entre:
  - Criar Orcamento (redireciona para `/orcamento/novo`, que e o formulario atual)
  - Criar Ordem de Servico (redireciona para `/os/nova`)
- Navegacao atualizada com links para: Novo Registro, Historico de Orcamentos, Historico de OS
- Header do sistema renomeado para "Sistema de Gestao" em vez de "Sistema de Orcamentos"

**Arquivos afetados:**
- `src/App.tsx` - novas rotas
- `src/pages/Index.tsx` - transformar em tela inicial (Home)
- Novo: `src/pages/OrcamentoNovo.tsx` - formulario de orcamento (mover logica atual do Index)

---

## Fase 2 - Banco de Dados (Migracao)

Criar as novas tabelas para o modulo de OS:

### Tabela `ordens_servico`
- `id` (uuid, PK)
- `numero` (text, auto-gerado por trigger similar ao orcamento: OS-YYYY-NNN)
- `status` (text, enum: aguardando_diagnostico, aguardando_orcamento, aguardando_aprovacao, aprovado, em_execucao, finalizado, entregue, abandonado)
- Dados do cliente (mesmos campos do orcamento: nome, cnpj, cpf, email, telefone, endereco, tipo_pessoa, nome_pessoa)
- Dados da maquina: tipo_maquina (gerador/compressor), marca, modelo, numero_serie, horimetro, potencia, tensao, estado_geral, acessorios_entregues
- Dados da retirada: data_retirada, hora_retirada, local_coleta, responsavel_retirada, placa_veiculo, defeito_relatado
- `clausula_permanencia` (text, texto padrao inserido automaticamente)
- `data_limite_abandono` (timestamptz, calculado automaticamente: data_retirada + 90 dias)
- `orcamento_id` (uuid, FK opcional para orcamentos - vinculacao)
- `created_at`, `updated_at`

### Tabela `diagnosticos`
- `id` (uuid, PK)
- `os_id` (uuid, FK para ordens_servico)
- `tecnico_responsavel` (text)
- `data_teste` (text)
- `problema_identificado` (text)
- `pecas_danificadas` (text)
- `causa_provavel` (text)
- `testes_realizados` (text)
- `resultado_final` (text)
- `observacoes` (text)
- `created_at`

### Tabela `conclusoes`
- `id` (uuid, PK)
- `os_id` (uuid, FK para ordens_servico)
- `servicos_executados` (text)
- `pecas_substituidas` (text)
- `valor_final` (numeric)
- `data_conclusao` (text)
- `data_entrega` (text)
- `garantia_meses` (integer)
- `observacoes_finais` (text)
- `created_at`

### Tabela `midias_os`
- `id` (uuid, PK)
- `os_id` (uuid, FK para ordens_servico)
- `etapa` (text: retirada, diagnostico, conclusao)
- `tipo` (text: foto, video)
- `url` (text)
- `descricao` (text)
- `created_at`

### Storage
- Criar bucket `os-midias` (publico) para upload de fotos e videos

### Trigger
- Trigger para gerar numero automatico da OS (similar ao orcamento)
- Trigger para calcular `data_limite_abandono` (data_retirada + 90 dias)

### RLS
- Politicas permissivas publicas (mesmo padrao do orcamento atual, sem autenticacao)

---

## Fase 3 - Formulario de Ordem de Servico

Criar pagina `/os/nova` com formulario em etapas (steps/tabs):

### Etapa 1: Relatorio de Retirada
- Dados do cliente (reutilizar componentes do orcamento)
- Dados da maquina (tipo, marca, modelo, numero serie, horimetro, potencia, tensao, estado geral, acessorios)
- Dados da retirada (data, hora, local, responsavel, placa, defeito relatado)
- Upload de fotos
- Clausula de permanencia (texto padrao pre-preenchido, editavel)
- Botao "Salvar OS"

### Etapa 2: Diagnostico/Teste
- Tecnico responsavel, data, descricao do problema, pecas danificadas, causa provavel, testes, resultado
- Upload de fotos e videos
- Botao "Salvar Diagnostico"

### Etapa 3: Conclusao/Entrega
- Servicos executados, pecas substituidas, valor final, datas, garantia, observacoes
- Botao "Finalizar OS"

**Arquivos novos:**
- `src/pages/OrdemServicoNova.tsx` - formulario principal com etapas
- `src/hooks/useOrdensServico.ts` - CRUD para OS
- `src/hooks/useMidias.ts` - upload de midias para storage

---

## Fase 4 - Historico e Visualizacao de OS

### Historico de OS (`/os/historico`)
- Lista todas as OS com filtro por status
- Exibe: numero, cliente, maquina, status (com badge colorido), data
- Botoes: Abrir, Excluir

### Visualizacao de OS (`/os/:id`)
- Exibe todas as informacoes da OS em secoes colapsaveis
- Galeria de fotos/videos por etapa
- Barra de status visual (timeline do fluxo)
- Botoes para: Alterar Status, Gerar PDF da OS, Compartilhar, Vincular Orcamento

**Arquivos novos:**
- `src/pages/OrdensServicoHistorico.tsx`
- `src/pages/OrdemServicoView.tsx`

---

## Fase 5 - Controle de Abandono (90 dias)

- Na listagem de OS, destacar visualmente as que estao proximas do prazo (ex: ultimos 15 dias)
- Exibir alerta/badge quando `data_limite_abandono` esta proximo ou ultrapassado
- Botao manual para marcar como "abandonado" (com confirmacao)
- A verificacao e feita no frontend ao listar as OS, sem necessidade de cron job inicialmente

---

## Fase 6 - Geracao de PDF da OS

Criar componente `OrdemServicoPDF.tsx` similar ao `OrcamentoPDF.tsx`, contendo:
- Relatorio de Retirada formatado
- Diagnostico tecnico
- Conclusao/entrega
- Galeria de fotos inline
- Clausula de permanencia
- Assinatura digital (campo em branco para impressao)

---

## Estrutura de Rotas Final

```text
/                    -> Tela inicial (escolher Orcamento ou OS)
/orcamento/novo      -> Formulario de orcamento (atual)
/historico           -> Historico de orcamentos (atual)
/orcamento/:id       -> Visualizar orcamento (atual)
/os/nova             -> Formulario de nova OS
/os/historico        -> Historico de OS
/os/:id              -> Visualizar OS
```

---

## Ordem de Implementacao Sugerida

Devido a complexidade, recomendo implementar em etapas:

1. **Primeiro**: Fase 1 (tela inicial) + Fase 2 (banco de dados) - estrutura base
2. **Segundo**: Fase 3 (formulario da OS - etapa de retirada apenas)
3. **Terceiro**: Fase 3 continuacao (diagnostico e conclusao) + storage para midias
4. **Quarto**: Fase 4 (historico e visualizacao)
5. **Quinto**: Fase 5 (controle de abandono) + Fase 6 (PDF da OS)

Cada etapa pode ser testada independentemente antes de avancar para a proxima.

---

## Secao Tecnica

### Componentes reutilizaveis a extrair
- Formulario de dados do cliente (usado em orcamento e OS)
- Header/Footer do sistema
- Componente de upload de midias

### Bibliotecas existentes utilizadas
- `jsPDF` + `html2canvas` para PDF
- `react-router-dom` para navegacao
- `lucide-react` para icones
- Supabase client para persistencia e storage

### Consideracoes
- Sem autenticacao (mantendo padrao atual do sistema)
- RLS permissiva publica (mesmo padrao)
- Upload de midias via Supabase Storage com bucket publico
- Status da OS controlado por campo texto (nao enum do Postgres) para flexibilidade

