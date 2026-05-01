# Incita B2B Pivot - Design Spec

**Data:** 2026-04-22
**Status:** Approved
**Abordagem:** Container hierárquico (Coordenador → Escola → Professores → Turmas → Alunos)

---

## 1. Contexto

O Incita está migrando de um modelo B2C (plataforma de estudos para alunos) para B2B (parceiro de gestão de ensino de redação para escolas e cursinhos). A mudança principal é permitir que:

- **Professores** continuem criando turmas e atividades (fluxo atual preservado)
- **Coordenadores/Diretores** tenham visibilidade sobre toda a escola, turmas e performance
- **Escolas** sejam entidades formais com gestão centralizada

O fluxo de turmas avulsas (sem escola) é mantido para não quebrar a experiência atual dos professores.

---

## 2. Novo Role: Coordinator

### Enum de roles atualizado: `student` | `teacher` | `coordinator` | `admin`

### Processo de solicitação (similar ao TeacherRequest)

Entidade **CoordRequest**:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| userId | UUID | FK → User que solicitou |
| schoolName | String | Nome da escola pretendida |
| city | String? | Cidade |
| state | String? | Estado (UF) |
| document | String? | CNPJ ou documento identificador |
| status | RequestStatus? | APPROVED / REFUSED / null (pendente) |
| reviewedById | UUID? | FK → User (admin que revisou) |
| reviewedAt | DateTime? | Data da revisão |
| hookUrl | String? | URL para webhook de notificação |
| createdAt | DateTime | Data de criação |

Fluxo:
1. User (student ou teacher) solicita role coordinator via `POST /coord-request`
2. Admin analisa e aprova/recusa
3. Ao aprovar: User.role = 'coordinator', School é criada com os dados do request
4. Notificação enviada ao solicitante

---

## 3. Entidade School (nova)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| name | String | Nome da escola |
| logoFileId | String? | Logo (arquivo no storage) |
| city | String? | Cidade |
| state | String? | Estado (UF) |
| inviteCode | String | Código único para professores se vincularem (gerado automaticamente) |
| createdAt | DateTime | Data de criação |

### Relações

- `coordinators` → User[] (many-to-many, via tabela SchoolCoordinator)
- `teachers` → User[] (many-to-many, via tabela SchoolTeacher)
- `classes` → Class[] (turmas vinculadas à escola)

### Entidade SchoolCoordinator (junção)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| schoolId | UUID | FK → School |
| coordinatorId | UUID | FK → User (role coordinator) |
| joinedAt | DateTime | Data de entrada |
| role | String | OWNER ou CO_COORDINATOR |

### Entidade SchoolTeacher (junção)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| schoolId | UUID | FK → School |
| teacherId | UUID | FK → User (role teacher) |
| joinedAt | DateTime | Data de entrada |
| status | SchoolTeacherStatus | PENDING / APPROVED / REMOVED |

### Enum SchoolTeacherStatus

- `PENDING` - Professor usou código de convite, aguardando aprovação do coordenador
- `APPROVED` - Coordenador aprovou o vínculo
- `REMOVED` - Coordenador removeu o professor da escola

---

## 4. Mudanças em Entidades Existentes

### Class

- **Remover:** campo `school` (String, texto livre)
- **Adicionar:** `schoolId` (UUID?, FK → School, opcional)
  - Se `schoolId` for null → turma avulsa (sem escola)
  - Se `schoolId` preenchido → turma vinculada à escola

### Activity

- **Adicionar:** campo `status` (ActivityStatus, default OPEN)
- **Adicionar:** campo `themeId` (UUID?, FK → Theme, opcional)

### Enum ActivityStatus (novo)

- `OPEN` - Alunos podem enviar redações
- `CLOSED` - Deadline passou, aguardando professor iniciar correções
- `REVIEWING` - Professor iniciou processo de correção
- `FINISHED` - Todas as redações foram revisadas pelo professor

### Essay

- **Adicionar:** `themeId` (UUID?, FK → Theme, opcional)

### TeacherCorrection

- **Adicionar:** `aiSuggestionId` (UUID?, FK → AICorrection, opcional)
  - Referência à sugestão da IA que o professor usou como base

### NotificationType (adicionar valores)

- `SCHOOL_INVITE` - Professor convidado para escola
- `COORD_REQUEST_STATUS` - Status de solicitação de coordenador
- `ACTIVITY_REVIEWING` - Atividade entrou em revisão
- `ACTIVITY_BATCH_CORRECTED` - Correção IA em lote concluída

---

## 5. Entidade Theme (nova - Banco de Temas ENEM)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| title | String | Título do tema |
| description | String? | Descrição/detalhamento |
| source | String? | Origem (ENEM 2023, Fuvest 2024, etc.) |
| year | Int? | Ano de referência |
| tags | String[] | Tags para busca e filtragem |
| isOfficial | Boolean | Se é tema oficial de vestibular |
| createdAt | DateTime | Data de criação |

- Disponível globalmente para todos os usuários
- Apenas admin pode criar/editar temas
- Professores e alunos podem usar temas do banco ou escrever temas próprios
- Quando um professor usa tema próprio, não cria registro na tabela Theme. O campo `theme` (texto livre) já existente no Essay e na Activity é usado para temas custom
- `themeId` (FK → Theme) é usado apenas quando o tema vem do banco oficial. Ambos podem coexistir: se `themeId` está preenchido, o título é copiado da tabela Theme; se não, usa o campo `theme` texto livre

---

## 6. Fluxo de Correção B2B (Atividades)

### Fluxo completo

```
Professor cria atividade (com tema do banco ou próprio)
    ↓
Alunos enviam redações (status = OPEN)
    ↓
Deadline passa OU todos entregaram (status → CLOSED)
    ↓
Professor clica "Corrigir com IA" (status → REVIEWING)
    → Todas as redações recebem correção IA automática (C1-C5)
    → Métricas preliminares geradas para dashboard
    ↓
Professor revisa cada redação individualmente
    → Vê sugestão da IA
    → Pode ajustar notas e feedbacks por competência
    → Confirma correção final
    ↓
Todas as redações revisadas (status → FINISHED)
    → Alunos recebem nota e feedback final
    → Métricas finais atualizadas
```

### Regras

- A nota final que o aluno recebe é **sempre** a confirmada pelo professor
- A correção IA serve como sugestão para agilizar o trabalho do professor
- Se o professor não quiser usar IA, pode corrigir manualmente do zero
- O dashboard mostra métricas tanto preliminares (pós-IA) quanto finais (pós-revisão)

### Novos endpoints de correção

- `POST /activity/:id/batch-correct-ai` - Dispara correção IA em lote para todas as respostas da atividade
- `PATCH /activity/essay/:responseId/teacher-correction` - Professor envia/revisa correção manual de uma resposta

---

## 7. Dashboards e Métricas

### 7.1 Dashboard do Coordenador (visão escola)

#### Visão geral

| Métrica | Descrição |
|---------|-----------|
| Total de turmas ativas | Turmas com atividades no período |
| Total de professores | Professores vinculados à escola |
| Total de alunos | Soma de alunos em todas as turmas |
| Total de redações no período | Todas as redações escritas na escola |
| Média geral por competência (C1-C5) | Média da escola inteira |
| Comparativo com período anterior | Delta de evolução |

#### Por turma

| Métrica | Descrição |
|---------|-----------|
| Média por competência (C1-C5) | Média da turma em cada competência |
| Distribuição de notas | Quantos alunos em cada faixa: 0-40, 40-80, 80-120, 120-160, 160-200 |
| Evolução temporal | Gráfico de linha - média por competência ao longo das redações |
| Taxa de entrega | % de alunos que entregaram por atividade |
| Alunos com maior dificuldade | Alunos com notas mais baixas |
| Alunos com maior evolução | Maior delta entre primeira e última redação |

#### Comparativo entre turmas

| Métrica | Descrição |
|---------|-----------|
| Nota média por competência | Comparação lado a lado entre turmas |
| Taxa de entrega comparada | % de entrega por turma |
| Professor responsável | Nome do professor de cada turma |

#### Por professor

| Métrica | Descrição |
|---------|-----------|
| Atividades criadas no período | Quantidade |
| Média dos alunos dele | Por competência |
| Tempo médio de correção | Entre entrega do aluno e feedback final |

### 7.2 Dashboard do Professor (visão turma)

#### Visão geral

| Métrica | Descrição |
|---------|-----------|
| Total de turmas | Avulsas + de escola |
| Total de alunos | Soma de todas as turmas |
| Atividades criadas | Total no período |
| Redações corrigidas | Total no período |

#### Por turma

| Métrica | Descrição |
|---------|-----------|
| Média por competência (C1-C5) | Da turma |
| Distribuição de notas | Faixas ENEM |
| Evolução temporal | Média por competência ao longo do tempo |
| Taxa de entrega por atividade | % de entrega |
| Lista de alunos | Com notas e status |

#### Por atividade

| Métrica | Descrição |
|---------|-----------|
| Entregues vs. total | Quantos entregaram |
| Média por competência | Da turma nessa atividade |
| Competências com mais dificuldade | Menores notas médias |
| Redações pendentes de revisão | Que ainda não foram revisadas manualmente |

#### Por aluno (dentro da turma)

| Métrica | Descrição |
|---------|-----------|
| Notas por competência | Em cada redação |
| Evolução ao longo do tempo | Gráfico |
| Competências fortes e fracas | Melhor e pior competência |
| Histórico de redações | Todas as entregas |

### 7.3 Dashboard do Aluno (visão individual)

#### Visão geral

| Métrica | Descrição |
|---------|-----------|
| Total de redações | Avulsas + atividades |
| Nota média geral | Soma C1-C5 |
| Evolução ao longo do tempo | Gráfico de linha |
| Competências fortes e fracas | Gráfico de radar |

#### Por competência

| Métrica | Descrição |
|---------|-----------|
| Nota média atual | Da competência |
| Evolução temporal | Ao longo das redações |
| Último feedback | Texto do feedback mais recente |

#### Histórico de redações

| Métrica | Descrição |
|---------|-----------|
| Lista com data, tema, nota, turma | Todas as redações |
| Comparação entre redações | Progresso |

### 7.4 KPIs do Negócio

| Métrica | Para Quem | Cálculo |
|---------|-----------|---------|
| Nota média por competência | Todos | Média das notas de cada competência (C1-C5) |
| Nota média geral | Todos | Soma C1-C5 (0-1000) |
| Taxa de entrega | Professor, Coord. | Entregues / Total alunos × 100 |
| Tempo médio de correção | Coord. | Média (data feedback final - data entrega aluno) |
| Evolução temporal | Todos | Delta nota primeira redação - nota última redação |
| Distribuição por faixa | Professor, Coord. | Count de alunos por faixa ENEM |
| Engajamento | Coord. | Redações por aluno no período |
| Taxa de adoção | Admin Incita | Professores ativos / professores cadastrados × 100 |

---

## 8. Gestão Escolar — Fluxos

### 8.1 Criação de escola

1. User solicita role coordinator via `POST /coord-request` com dados da escola
2. Admin analisa e aprova via `PUT /coord-request/:id`
3. Sistema cria automaticamente: User.role = 'coordinator', School com dados do request, SchoolCoordinator com role OWNER
4. Notificação enviada ao novo coordenador

### 8.2 Convite de professores

1. Coordenador gera/compartilha código de convite da escola (já existe no cadastro)
2. Professor usa código via `POST /school/join { inviteCode }`
3. Cria registro SchoolTeacher com status PENDING
4. Coordenador vê solicitação e aprova via `PATCH /school/:id/teachers/:teacherId/approve`
5. Professor pode criar turmas dentro da escola

### 8.3 Convite de coordenadores adicionais

1. Coordenador convida outro usuário via `POST /school/:id/coordinators { email }`
2. Se o usuário já tem role coordinator → vínculo direto (SchoolCoordinator, role CO_COORDINATOR)
3. Se não → solicitação de elevação de role (fluxo CoordRequest simplificado)
4. Ambos gerenciam a mesma escola

### 8.4 Turmas dentro de escola

1. Professor cria turma com `schoolId` preenchido
2. Turma aparece no dashboard do coordenador automaticamente
3. Código de convite da turma segue fluxo atual (alunos entram normalmente)

### 8.5 Turmas avulsas

- Professores criam turmas sem `schoolId` (null)
- Não aparecem em dashboards de coordenador
- Professor vê tanto turmas de escola quanto avulsas no seu painel

---

## 9. Permissões

**Nota sobre roles compostos:** Cada usuário tem apenas um role primário. Se um coordenador também precisa criar turmas e corrigir redações, ele deve ter role `teacher` e ser coordenador via vínculo SchoolCoordinator (não via role). A role `coordinator` é exclusiva para gestão escolar. Um mesmo usuário pode ter role `teacher` E ser coordenador de uma escola via SchoolCoordinator — nesse caso ele acumula as permissões de ambas.

| Ação | Student | Teacher | Coordinator | Admin |
|------|---------|---------|-------------|-------|
| Criar escola | - | - | Via aprovação admin | ✅ |
| Editar dados da escola | - | - | ✅ (sua escola) | ✅ |
| Gerenciar convites da escola | - | - | ✅ | ✅ |
| Aprovar professores na escola | - | - | ✅ | ✅ |
| Remover professores da escola | - | - | ✅ | ✅ |
| Criar turma avulsa | - | ✅ | - | ✅ |
| Criar turma em escola | - | ✅ (se vinculado) | - | ✅ |
| Gerenciar turma | - | ✅ (suas turmas) | - | ✅ |
| Ver dashboard escola | - | - | ✅ (sua escola) | ✅ (todas) |
| Ver dashboard turma | ✅ (sua turma) | ✅ (suas turmas) | ✅ (turmas da escola) | ✅ |
| Ver dashboard aluno (outro) | - | ✅ (alunos das turmas) | ✅ (alunos da escola) | ✅ |
| Ver dashboard aluno (próprio) | ✅ | ✅ | - | ✅ |
| Corrigir redações | - | ✅ (suas turmas) | - | ✅ |
| Correção IA em lote | - | ✅ (suas atividades) | - | ✅ |
| Exportar relatórios escola | - | - | ✅ | ✅ |
| Exportar relatórios turma | - | ✅ (suas turmas) | ✅ (turmas da escola) | ✅ |
| Exportar relatório aluno | ✅ (próprio) | ✅ (alunos das turmas) | ✅ (alunos da escola) | ✅ |
| Solicitar role professor | ✅ | - | - | - |
| Solicitar role coordenador | ✅ | ✅ | - | - |
| Aprovar roles | - | - | - | ✅ |
| Gerenciar temas ENEM | - | - | - | ✅ |
| Usar temas ENEM | ✅ | ✅ | - | ✅ |

---

## 10. Exportação

### CSV (primeiro)

- Relatório de turma: notas por aluno por competência em cada atividade
- Relatório de escola: resumo de todas as turmas com médias
- Histórico do aluno: todas as redações e notas ao longo do tempo
- Filtros: período (data início/fim), turma, competência

### PDF (depois)

- Relatórios formatados com identidade visual da escola (logo, nome)
- Inclui gráficos exportados como imagem
- Agrupado por turma e/ou por aluno

---

## 11. Novos Endpoints

### School

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| POST | `/school` | Criar escola | admin |
| GET | `/school/:id` | Dados da escola | coordinator (sua), admin |
| PATCH | `/school/:id` | Editar escola | coordinator (sua), admin |
| GET | `/school/:id/invite-code` | Ver código de convite | coordinator, admin |
| POST | `/school/:id/regenerate-invite` | Regenerar código | coordinator, admin |
| POST | `/school/join` | Professor entra via código | teacher |
| GET | `/school/:id/teachers` | Listar professores | coordinator, admin |
| PATCH | `/school/:id/teachers/:teacherId/approve` | Aprovar professor | coordinator, admin |
| PATCH | `/school/:id/teachers/:teacherId/remove` | Remover professor | coordinator, admin |
| GET | `/school/:id/classes` | Listar turmas | coordinator, admin |
| POST | `/school/:id/coordinators` | Convidar coordenador | coordinator, admin |
| GET | `/school/:id/dashboard` | Dashboard da escola | coordinator, admin |
| GET | `/school/:id/export` | Exportar CSV da escola | coordinator, admin |

### CoordRequest

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| POST | `/coord-request` | Solicitar role coordenador | student, teacher |
| GET | `/coord-request` | Listar solicitações | admin |
| PUT | `/coord-request/:id` | Aprovar/recusar | admin |

### Theme

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| GET | `/theme` | Listar temas (com filtros) | todos |
| GET | `/theme/:id` | Detalhes do tema | todos |
| POST | `/theme` | Criar tema | admin |
| PATCH | `/theme/:id` | Editar tema | admin |
| DELETE | `/theme/:id` | Remover tema | admin |

### Dashboard

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| GET | `/class/:id/dashboard` | Dashboard da turma | teacher (suas), coordinator (escola), admin |
| GET | `/class/:id/export` | Exportar CSV da turma | teacher, coordinator, admin |
| GET | `/activity/:id/dashboard` | Dashboard da atividade | teacher, coordinator, admin |
| GET | `/user/:id/performance` | Dashboard do aluno | student (próprio), teacher, coordinator, admin |
| GET | `/user/:id/performance/export` | Exportar histórico do aluno | student (próprio), teacher, coordinator, admin |

### Atividades (extensões)

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| POST | `/activity/:id/batch-correct-ai` | Corrigir todas com IA | teacher (sua atividade) |
| PATCH | `/activity/:id/status` | Atualizar status | teacher |
| GET | `/activity/:id/pending-reviews` | Redações pendentes de revisão | teacher |

---

## 12. Novos Módulos NestJS

| Módulo | Responsabilidade |
|--------|-----------------|
| SchoolModule | CRUD de escola, convites, gestão de professores |
| CoordRequestModule | Solicitação e aprovação de role coordenador |
| ThemeModule | CRUD de temas ENEM |
| DashboardModule | Agregação de métricas e geração de dashboards |
| ExportModule | Geração de CSV (e futuramente PDF) |

---

## 13. Resumo de Impacto no Projeto

### O que muda
- **Role system:** novo role `coordinator`
- **Class:** `school` texto → `schoolId` FK formal
- **Activity:** novo campo `status` (ActivityStatus enum) e `themeId`
- **Essay:** campo `themeId` opcional
- **TeacherCorrection:** campo `aiSuggestionId`
- **NotificationType:** novos valores
- **Fluxo de correção:** IA como sugestão + revisão obrigatória do professor em atividades

### O que é novo
- Entidade School + SchoolCoordinator + SchoolTeacher
- Entidade CoordRequest
- Entidade Theme
- Enum ActivityStatus, SchoolTeacherStatus
- 5 novos módulos NestJS
- ~20 novos endpoints
- Sistema completo de dashboards com métricas agregadas
- Exportação CSV

### O que NÃO muda
- Repertórios (continuam globais)
- Redações avulsas (correção IA direta, sem revisão de professor)
- Sistema de integração (API keys)
- Notificações SSE
- Autenticação (better-auth)
- Sistema de arquivos/storage
