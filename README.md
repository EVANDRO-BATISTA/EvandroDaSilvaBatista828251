# Registro Publico de Pets - Mato Grosso

Sistema de registro publico de Pets e seus tutores do Estado de Mato Grosso.

## Dados do Candidato

- **Nome:** [Evandro da Silva Batista]
- **Vaga:** Desenvolvedor Frontend
- **Data:** Janeiro/2026

## Arquitetura do Projeto

### Tecnologias Utilizadas

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilizacao:** Tailwind CSS v4
- **Componentes:** shadcn/ui
- **Gerenciamento de Estado:** React Context API + SWR
- **Testes:** Jest + React Testing Library

### Estrutura de Pastas

```
/
├── app/
│   ├── (main)/                    # Rotas protegidas com layout principal
│   │   ├── page.tsx               # Pagina inicial (listagem de pets)
│   │   ├── pets/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx       # Detalhes do pet
│   │   │   │   └── editar/
│   │   │   │       └── page.tsx   # Edicao do pet
│   │   │   └── novo/
│   │   │       └── page.tsx       # Cadastro de pet
│   │   └── tutores/
│   │       ├── page.tsx           # Listagem de tutores
│   │       ├── [id]/
│   │       │   ├── page.tsx       # Detalhes do tutor
│   │       │   ├── editar/
│   │       │   │   └── page.tsx   # Edicao do tutor
│   │       │   └── vincular/
│   │       │       └── page.tsx   # Vincular pets ao tutor
│   │       └── novo/
│   │           └── page.tsx       # Cadastro de tutor
│   ├── api/                       # API Local (Mock)
│   │   ├── autenticacao/
│   │   │   ├── login/
│   │   │   └── refresh/
│   │   └── v1/
│   │       ├── pets/
│   │       └── tutores/
│   ├── login/
│   │   └── page.tsx               # Pagina de login
│   ├── layout.tsx                 # Layout raiz
│   └── globals.css                # Estilos globais
├── components/
│   ├── header.tsx                 # Cabecalho com navegacao
│   ├── pets/
│   │   ├── pet-card.tsx           # Card de pet
│   │   ├── pet-form.tsx           # Formulario de pet
│   │   └── pet-list.tsx           # Listagem de pets
│   ├── tutores/
│   │   ├── tutor-card.tsx         # Card de tutor
│   │   ├── tutor-form.tsx         # Formulario de tutor
│   │   └── tutor-list.tsx         # Listagem de tutores
│   └── ui/                        # Componentes shadcn/ui
├── contexts/
│   └── auth-context.tsx           # Contexto de autenticacao
├── hooks/
│   └── use-debounce.ts            # Hook de debounce
├── lib/
│   ├── api.ts                     # Cliente da API
│   ├── mock-db.ts                 # Banco de dados mock
│   ├── types.ts                   # Tipos TypeScript
│   └── utils.ts                   # Utilitarios
└── __tests__/                     # Testes unitarios
    ├── components/
    ├── hooks/
    └── lib/
```

### Padrao de Arquitetura

O projeto segue o padrao de arquitetura **Clean Architecture** adaptado para frontend:

1. **Camada de Apresentacao (app/, components/):** Componentes React e paginas
2. **Camada de Dominio (lib/types.ts):** Entidades e interfaces
3. **Camada de Dados (lib/api.ts):** Comunicacao com API externa
4. **Camada de Infraestrutura (contexts/, hooks/):** Servicos e utilitarios

## Como Executar

### Pre-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalacao

```bash
# Clonar o repositorio
git clone [url-do-repositorio]

# Instalar dependencias
npm install

# Executar em modo desenvolvimento
npm run dev
```

### Tema / Modo Escuro

- Suporte a tema claro/escuro via `next-themes`. O `ThemeProvider` está configurado em `app/layout.tsx` com `attribute="class"` e `defaultTheme="system"`.
- Há um botão de alternância no cabeçalho (ícone sol/lua) e uma opção **"Alternar tema"** no menu mobile.
- As variáveis do tema ficam em `app/globals.css` (classe `.dark`). Para ajustar o visual do modo escuro, altere variáveis como `--background`, `--card`, `--popover`, `--foreground` e `--border`.

### Variaveis de Ambiente

```env
# Para usar a API local (padrao - nao precisa configurar nada)
# A aplicacao usara /api automaticamente

# Para usar a API publica
NEXT_PUBLIC_API_URL=https://pet-manager-api.gela.vip
```

## Como Testar

### Credenciais de Teste (API Local)

| Usuario | Senha      |
|---------|------------|
| admin   | admin123   |
| teste   | teste123   |

### Funcionalidades Disponiveis

#### Sem Login (Acesso Publico)
- Visualizar listagem de pets
- Buscar pets por nome
- Visualizar detalhes de um pet
- Visualizar listagem de tutores
- Visualizar detalhes de um tutor

#### Com Login (Acesso Autenticado)
- Cadastrar novo pet
- Editar pet existente
- Excluir pet
- Upload de foto do pet
- Cadastrar novo tutor
- Editar tutor existente
- Excluir tutor
- Upload de foto do tutor
- Vincular/desvincular pets a tutores

### Executar Testes Unitarios

```bash
# Executar todos os testes
npm test

# Executar testes com coverage
npm test -- --coverage

# Executar testes em modo watch
npm test -- --watch
```

## Endpoints da API

### Autenticacao

| Metodo | Endpoint                    | Descricao           |
|--------|----------------------------|---------------------|
| POST   | /autenticacao/login        | Realizar login      |
| POST   | /autenticacao/refresh      | Renovar token       |

### Pets

| Metodo | Endpoint                    | Descricao           |
|--------|----------------------------|---------------------|
| GET    | /v1/pets                   | Listar pets         |
| GET    | /v1/pets/:id               | Obter pet por ID    |
| POST   | /v1/pets                   | Criar pet           |
| PUT    | /v1/pets/:id               | Atualizar pet       |
| DELETE | /v1/pets/:id               | Excluir pet         |
| POST   | /v1/pets/:id/fotos         | Upload de foto      |

### Tutores

| Metodo | Endpoint                    | Descricao           |
|--------|----------------------------|---------------------|
| GET    | /v1/tutores                | Listar tutores      |
| GET    | /v1/tutores/:id            | Obter tutor por ID  |
| POST   | /v1/tutores                | Criar tutor         |
| PUT    | /v1/tutores/:id            | Atualizar tutor     |
| DELETE | /v1/tutores/:id            | Excluir tutor       |
| POST   | /v1/tutores/:id/fotos      | Upload de foto      |
| GET    | /v1/tutores/:id/pets       | Listar pets do tutor|
| POST   | /v1/tutores/:id/pets/:petId| Vincular pet        |
| DELETE | /v1/tutores/:id/pets/:petId| Desvincular pet     |

## Decisoes Tecnicas

### Por que Next.js App Router?
- Server Components para melhor performance
- Rotas baseadas em arquivos
- Suporte nativo a layouts aninhados
- API Routes integradas para mock local

### Por que shadcn/ui?
- Componentes acessiveis e customizaveis
- Nao adiciona dependencias pesadas
- Facil integracao com Tailwind CSS

### Por que SWR?
- Cache automatico de requisicoes
- Revalidacao em background
- Suporte a paginacao
- Mutacao otimista

### Por que API Local Mock?
- Permite desenvolvimento offline
- Testes independentes do backend
- Facil troca para API de producao (apenas mudar variavel de ambiente)

## Licenca

Este projeto foi desenvolvido como parte de um processo seletivo.
