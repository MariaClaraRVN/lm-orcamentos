# 🔧 LM Manutenções - Sistema de Gestão

Um sistema feito para a oficina **LM Manutenções**, que conserta **geradores** e **compressores** (máquinas grandes que fazem energia ou ar comprimido).

---

## 🤔 O que esse sistema faz?

Imagina que você tem uma oficina e um cliente liga pedindo pra consertar uma máquina. Você precisa anotar tudo certinho: quem é o cliente, qual é a máquina, o que está quebrado, quanto vai custar... Esse sistema faz tudo isso no computador, de um jeito organizado!

O sistema tem **duas partes principais**:

### 📋 1. Orçamentos
Um orçamento é como uma **lista de compras do conserto**. Antes de consertar, você diz pro cliente:
> "Olha, pra arrumar sua máquina, vai precisar trocar tal peça e fazer tal serviço. Vai custar R$ X."

O cliente olha e decide se quer ou não.

**O que dá pra fazer:**
- ✏️ Criar um orçamento novo com os dados do cliente e da máquina
- 📝 Adicionar os itens (peças, serviços) com preço e quantidade
- 📄 Gerar um PDF bonitinho pra mandar pro cliente
- 📚 Ver o histórico de todos os orçamentos já feitos

### 🔩 2. Ordens de Serviço (OS)
A Ordem de Serviço é o **documento que acompanha o conserto do começo ao fim**. Ela tem 3 etapas, como 3 capítulos de uma história:

#### 📦 Etapa 1: Retirada
Quando a oficina vai buscar a máquina no cliente. Anota-se:
- Quem é o cliente (nome, telefone, endereço...)
- Qual é a máquina (tipo, marca, modelo)
- Onde foi buscada, quem buscou, qual carro usou
- O que o cliente disse que está quebrado
- Fotos da máquina no estado que chegou
- Uma **cláusula de permanência** (um aviso dizendo que se o cliente não buscar a máquina em 90 dias, a oficina pode ficar com ela)

#### 🔍 Etapa 2: Diagnóstico
É quando o técnico examina a máquina pra descobrir o que realmente está errado. Como um médico examinando um paciente! Anota-se:
- Qual técnico fez o teste
- Qual problema foi encontrado
- Quais peças estão danificadas
- O que provavelmente causou o problema
- Fotos e vídeos dos testes

#### ✅ Etapa 3: Conclusão
Quando o conserto termina! Anota-se:
- O que foi feito (serviços executados)
- Quais peças foram trocadas
- Quanto custou no final
- Quando ficou pronto e quando foi entregue
- Quantos meses de garantia tem
- Fotos da máquina consertada

**Cada etapa gera seu próprio PDF** para imprimir ou enviar pro cliente.

---

## 🗺️ Páginas do Sistema

| Endereço | O que faz |
|---|---|
| `/` | Tela inicial - escolher entre criar Orçamento ou OS |
| `/orcamento/novo` | Formulário para criar um orçamento novo |
| `/historico` | Lista de todos os orçamentos |
| `/orcamento/:id` | Ver um orçamento específico |
| `/os/nova` | Formulário para criar uma nova Ordem de Serviço |
| `/os/historico` | Lista de todas as Ordens de Serviço |
| `/os/:id` | Ver uma OS específica (com diagnóstico e conclusão) |

---

## 🛠️ Tecnologias Usadas

| Tecnologia | Pra que serve |
|---|---|
| **React** | Constrói as telas e botões que você vê |
| **TypeScript** | A linguagem que o código é escrito (como português pro computador) |
| **Tailwind CSS** | Deixa tudo bonito com cores, espaçamentos e estilos |
| **shadcn/ui** | Componentes prontos como botões, tabelas, formulários |
| **Lovable Cloud** | O banco de dados que guarda todas as informações |
| **jsPDF + html2canvas** | Gera os PDFs dos orçamentos e ordens de serviço |
| **React Router** | Faz a navegação entre as páginas |
| **TanStack Query** | Busca e atualiza os dados do banco de forma inteligente |
| **Vite** | Faz o projeto rodar rápido no navegador |

---

## 📁 Organização das Pastas

```
src/
├── pages/              ← As páginas do sistema
│   ├── Index.tsx           (Tela inicial)
│   ├── OrcamentoNovo.tsx   (Criar orçamento)
│   ├── OrcamentoView.tsx   (Ver orçamento)
│   ├── Historico.tsx        (Lista de orçamentos)
│   ├── OrdemServicoNova.tsx (Criar OS - etapa retirada)
│   ├── OrdemServicoView.tsx (Ver OS - diagnóstico e conclusão)
│   └── OrdensServicoHistorico.tsx (Lista de OS)
│
├── components/         ← Pedaços reutilizáveis
│   ├── OrcamentoPDF.tsx     (PDF do orçamento)
│   ├── OSRetiradaPDF.tsx    (PDF da retirada)
│   ├── OSDiagnosticoPDF.tsx (PDF do diagnóstico)
│   ├── OSConclusaoPDF.tsx   (PDF da conclusão)
│   ├── PageHeader.tsx       (Cabeçalho das páginas)
│   ├── NavLink.tsx          (Links de navegação)
│   └── ui/                  (Componentes visuais: botões, tabelas, etc.)
│
├── hooks/              ← Funções que conversam com o banco de dados
│   ├── useOrcamentos.ts     (Criar, buscar, deletar orçamentos)
│   └── useOrdensServico.ts  (Criar, buscar, atualizar OS, diagnósticos, etc.)
│
└── integrations/       ← Conexão com o banco de dados
    └── supabase/
        ├── client.ts        (Configuração da conexão)
        └── types.ts         (Tipos de dados das tabelas)
```

---

## 💾 Banco de Dados

O sistema guarda tudo em **5 tabelas** (como 5 planilhas do Excel):

1. **orcamentos** - Dados dos orçamentos
2. **itens_orcamento** - Os itens de cada orçamento (peças e serviços)
3. **ordens_servico** - Dados das OS (cliente, máquina, retirada)
4. **diagnosticos** - O diagnóstico técnico de cada OS
5. **conclusoes** - A conclusão/entrega de cada OS
6. **midias_os** - Fotos e vídeos anexados em cada etapa da OS

---

## 🚀 Como rodar o projeto

```bash
# 1. Clonar o projeto
git clone <URL_DO_REPOSITORIO>

# 2. Entrar na pasta
cd <NOME_DO_PROJETO>

# 3. Instalar as dependências
npm install

# 4. Rodar o projeto
npm run dev
```

Depois é só abrir o navegador e acessar o endereço que aparecer no terminal! 🎉
