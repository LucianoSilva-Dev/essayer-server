# Fases 3.7 e 3.8 — Notifications + AI Correction

> **Meta:** Implementar o sistema de Notifications (com SSE) e AI Essay Correction (com BullMQ worker), completando as fases 3.7 e 3.8. Também completa os pré-requisitos bloqueantes: fase 2.5 (BullMQModule) e fase 2.9 (AIModule).

**Arquitetura:** Event-driven com `@nestjs/event-emitter`. Notifications são criadas por listeners que reagem a eventos de domínio (`activity.submitted`, `activity.closed`, `activity.corrected`, `teacher-request.status`) e streamadas via SSE. Correções AI são processadas async via BullMQ workers usando Vercel AI SDK com **dois modelos: `gemini-3-flash-preview` (primário) e `gemini-2.5-pro` (fallback)**, com rate limiting via Redis.

**Stack:** NestJS 11, Prisma 7 (PostgreSQL), BullMQ + Redis, Vercel AI SDK (`ai` + `@ai-sdk/google`), RxJS (SSE via `@Sse()`), Zod 4

**Refs:** `essayer-server-old/` (implementação Fastify+Mongo), `anglo-server/` (padrões NestJS, DTO/Zod docs, API_ROADMAP.md), `incita-refactor-struct.md` (fluxo de desenvolvimento)

---

## Arquivos

### Novos

```
src/core/bullmq/
├── bullmq.module.ts                  # Global module, registra filas
├── bullmq.constants.ts               # Nome da fila ESSAY_CORRECTION_QUEUE
├── types.ts                          # Interface IEssayCorrectionJobData
└── index.ts

src/core/ai/
├── ai.module.ts                      # Global module (interface + provider)
├── ai.constants.ts                   # Token AI_PROVIDER
├── types.ts                          # IAIProvider, IAIModelConfig, ModelRole
├── providers/
│   └── vercel-ai.provider.ts         # Implementação com Vercel AI SDK (dual model)
├── helpers/
│   ├── rate-limit.ts                 # RPM/RPD check + increment via Redis
│   └── redis-keys.ts                 # Geradores de chave Redis por modelo
├── prompts.ts                        # System instruction + formatador de prompt
└── index.ts

src/features/notification/
├── dto/
│   ├── change-status.dto.ts           # PUT body: notificationIds[]
│   └── notification-response.dto.ts   # GET response: discriminated union por type
├── notification.listener.ts           # Cria notifications reativo a eventos
└── sse-connections.manager.ts         # Map<userId, Set<Subject>> para SSE

src/features/user-essay/
├── dto/
│   ├── correct-essay.dto.ts           # POST body: theme + essayText
│   └── ai-correction-response.dto.ts  # Discriminated union por status (FINISHED|PENDING|ERROR)
├── workers/
│   ├── essay-correction.queue.ts      # Wrapper da fila BullMQ
│   └── essay-correction.worker.ts     # Processor com backoff exponencial + fallback
├── listeners/
│   ├── correction-completed.listener.ts  # Persiste resultado no DB
│   └── correction-sse.listener.ts        # Push SSE para clients conectados
└── sse-connections.manager.ts         # Map<essayId, Set<Subject>> para SSE
```

### Modificados

```
src/core/prisma/schema.prisma           # +ACTIVITY_CLOSED enum + ActivityNotification model
src/config/env.schema.ts                # +AI model env vars (primário + fallback)
.env.example                            # +AI model vars
src/app.module.ts                       # +BullMQModule + AIModule imports
src/features/notification/              # Controller, Service, Repository, Module (todos stubs → implementados)
src/features/user-essay/                # Controller, Service, Repository, Module (stubs → implementados)
src/features/user-essay/dto/get-user-essay-response.dto.ts  # +corrections array
src/features/activity/activity.service.ts         # Emitir eventos
src/features/teacher-request/teacher-request.service.ts  # Emitir eventos
incita-refactor-struct.md              # Marcar fases como completas
```

---

## Task 1: Prisma Schema Updates

Adicionar `ACTIVITY_CLOSED` ao enum `NotificationType` e criar model `ActivityNotification` (paralelo ao `TeacherRequestStatusNotification` existente). Notifications de activity (sent, closed, corrected) carregam `activityId`; notifications de teacher-request carregam `teacherRequestId` + `reason`.

- [ ] Adicionar `ACTIVITY_CLOSED` ao enum `NotificationType` no `schema.prisma`
- [ ] Criar model `ActivityNotification` com campos `id`, `activityId`, `notificationId` (@unique) e relações `activity` e `notification`
- [ ] Adicionar relação `activityNotification ActivityNotification?` ao model `Notification`
- [ ] Adicionar relação `activityNotifications ActivityNotification[]` ao model `Activity`
- [ ] Rodar `pnpm prisma:migrate:dev --name add_activity_notification`
- [ ] Rodar `pnpm prisma:generate`

---

## Task 2: BullMQ Core Module (Fase 2.5)

Criar módulo global BullMQ com `forRootAsync` (configuração padrão: `removeOnComplete: true`, `attempts: 10`) e `registerQueue` para a fila `essay-correction`. Exportar `BullModule` para que filas possam ser injetadas em qualquer feature. Criar types com `IEssayCorrectionJobData` (essayId, correctionId, theme, text, userId).

- [ ] Criar `src/core/bullmq/bullmq.constants.ts` com `ESSAY_CORRECTION_QUEUE`
- [ ] Criar `src/core/bullmq/types.ts` com `IEssayCorrectionJobData`
- [ ] Criar `src/core/bullmq/bullmq.module.ts` — `@Global()`, importa `BullModule.forRootAsync` + `BullModule.registerQueue`, exporta `BullModule`
- [ ] Criar `src/core/bullmq/index.ts` com barrel exports

---

## Task 3: AI Core Module (Fase 2.9)

Criar módulo global AI com interface `IAIProvider` e implementação via Vercel AI SDK. **Estratégia dual-model: `gemini-3-flash-preview` como primário, `gemini-2.5-pro` como fallback.** Rate limiting baseado em Redis (RPM/RPD) por modelo. Quando o modelo primário falha (429/503), marca como unavailable com TTL e tenta o fallback.

### Env vars (adicionar em `env.schema.ts` e `.env.example`):
- `AI_PRIMARY_MODEL_NAME` (default: `gemini-3-flash-preview`)
- `AI_PRIMARY_MODEL_RPM` (default: 15)
- `AI_PRIMARY_MODEL_RPD` (default: 1500)
- `AI_FALLBACK_MODEL_NAME` (default: `gemini-2.5-pro`)
- `AI_FALLBACK_MODEL_RPM` (default: 5)
- `AI_FALLBACK_MODEL_RPD` (default: 500)
- `AI_MODEL_UNAVAILABLE_TIMEOUT_SECS` (default: 60)

### Interface IAIProvider:
- `generateObject<T>(prompt, schema, system?): Promise<T>` — tenta primário, se falhar tenta fallback
- `generate(prompt, system?): Promise<string>` — tenta primário, se falhar tenta fallback

### Interface IAIModelConfig:
- `name`, `rpm`, `rpd`, `role: 'primary' | 'fallback'`

### Helpers:
- `redis-keys.ts` — geradores de chave: `{modelName}:rpd`, `{modelName}:rpm`, `{modelName}:unavailable`
- `rate-limit.ts` — `checkModelAvailability(redis, model)` retorna `{available, reason?}`, `incrementRateLimitCounters(redis, model)` incrementa com TTL, `markModelUnavailable(redis, model)` set com TTL

### VercelAIProvider:
- No constructor, lê config de ambos os modelos via ConfigService
- `generateObject`: tenta chamar modelo primário, se der erro 429/503 marca primário como unavailable e tenta fallback. Se fallback também falhar, propaga o erro
- `generate`: mesma lógica de primary → fallback
- Usa `generateObject` e `generateText` do Vercel AI SDK com `google(modelName)` do `@ai-sdk/google`
- Usa `checkModelAvailability` antes de cada chamada para pular modelos indisponíveis

### Prompts:
- `essayCorrectionSystemPrompt` — instrução para corretor ENEM (competências C1-C5, notas 0-200 em múltiplos de 40, feedbacks em JSON)
- `formatEssayCorrectionPrompt(theme, essayText)` — formata o prompt do usuário

- [ ] Adicionar env vars em `env.schema.ts` e `.env.example`
- [ ] Criar `ai.constants.ts`, `types.ts`, `helpers/redis-keys.ts`, `helpers/rate-limit.ts`, `prompts.ts`
- [ ] Criar `providers/vercel-ai.provider.ts` com lógica primary → fallback
- [ ] Criar `ai.module.ts` — `@Global()`, provê `AI_PROVIDER` token com `VercelAIProvider`
- [ ] Criar `index.ts` com barrel exports
- [ ] Registrar `BullMQModule` e `AIModule` em `app.module.ts`

---

## Task 4: Notification DTOs + Repository

### DTOs:
- `change-status.dto.ts` — Zod schema com `notificationIds: z.array(z.string().min(1)).min(1)`, usar `createZodDto`
- `notification-response.dto.ts` — Array de discriminated union por `type`:
  - `ACTIVITY_SENT`: id, type, read, activityId
  - `ACTIVITY_CLOSED`: id, type, read, activityId
  - `ACTIVITY_CORRECTED`: id, type, read, activityId
  - `TEACHER_REQUEST_STATUS`: id, type, read, teacherRequestId, reason? (opcional)
  - Cada schema com `.meta({ id: '...' })` para OpenAPI

### Repository (`notification.repository.ts`):
- `findByRecipientUserId(userId)` — busca notifications onde o usuário é sender, com include de `activityNotification.activity` e `teacherRequestStatus.teacherRequest`, ordenado por `createdAt desc`
- `markAsRead(userId, notificationIds)` — conecta o usuário em `seenBy` nas notifications
- `createActivityNotification(type, activityId, recipientIds)` — cria Notification com `activityNotification` e conecta recipients em `senders`
- `createTeacherRequestNotification(teacherRequestId, recipientIds, reason?)` — cria Notification com `teacherRequestStatus` (incluindo `motivo`) e conecta recipients

- [ ] Criar DTOs
- [ ] Implementar repository com Prisma

---

## Task 5: Notification SSE Manager + Event Listener

### SSE Manager (`sse-connections.manager.ts`):
- Map interno `<userId, Set<Subject<SseNotificationEvent>>>`
- `addConnection(userId, subject)`, `removeConnection(userId, subject)`, `pushToUser(userId, event)`, `pushToUsers(userIds, event)`
- Limpa do map quando Set fica vazio

### Notification Listener (`notification.listener.ts`):
- Reage a 4 eventos via `@OnEvent` com `{ async: true }`:
  - `activity.submitted` → cria `ACTIVITY_SENT` notification + push SSE
  - `activity.closed` → cria `ACTIVITY_CLOSED` notification + push SSE
  - `activity.corrected` → cria `ACTIVITY_CORRECTED` notification + push SSE
  - `teacher-request.status` → cria `TEACHER_REQUEST_STATUS` notification + push SSE
- Cada handler: cria notification no DB via repository, depois faz push SSE via manager com JSON stringified data
- Loga erros com Logger, não propaga exceções

- [ ] Criar SSE connections manager
- [ ] Criar notification listener com 4 handlers

---

## Task 6: Notification Service + Controller + Module

### Service (`notification.service.ts`):
- `getAll(userId)` — busca notifications via repo, formata cada uma no shape do discriminated union DTO (baseado no `type`, monta objeto com os campos corretos). Campo `read` = `seenBy.length > 0`
- `changeStatus(userId, notificationIds)` — delega ao repo `markAsRead`
- `listen(userId)` — cria Subject, registra no SSE manager, merge com heartbeat$ (interval 30s), map para `MessageEvent`, finalize para cleanup

### Controller (`notification.controller.ts`):
- `@Controller('notification')`, `@ApiTags('Notification')`, `@UsePipes(ZodValidationPipe)`
- `GET /` — `@ZodResponse` com `NotificationResponseDto[]`, usa `@Session()` para userId
- `PUT /` — body `ChangeStatusDto`, `@ZodResponse` com `NullResponseDto`
- `@Sse('listen')` — retorna `Observable<MessageEvent>`, `@Session()` para userId

### Module (`notification.module.ts`):
- Providers: Service, Repository, Listener, SSE Manager

- [ ] Implementar service
- [ ] Implementar controller
- [ ] Atualizar module

---

## Task 7: Wire Notification Events

Conectar os eventos de domínio que já têm `// TODO: emit event for notification` nos services existentes.

### ActivityService:
- Injetar `EventEmitter2`
- No método `send` (submissão de redação): emitir `activity.submitted` com `ActivitySubmittedPayload(activityId, classMemberIds)`
- No método de feedback/correção: emitir `activity.corrected` com `ActivityCorrectedPayload(activityId, [studentId])`
- Pode ser necessário adicionar método `getClassMemberIds(essayId)` no ActivityRepository (busca members da turma da activity)

### TeacherRequestService:
- Injetar `EventEmitter2`
- No método `updateStatus`: após update, emitir `teacher-request.status` com `TeacherRequestStatusPayload(id, userId, isApproved, reason)`

- [ ] Emitir eventos no ActivityService
- [ ] Emitir eventos no TeacherRequestService
- [ ] Adicionar métodos auxiliares no repository se necessário

---

## Task 8: AI Correction DTOs

- `correct-essay.dto.ts` — `theme: z.string().min(1)`, `essayText: z.string().min(1)`, com `createZodDto`
- `ai-correction-response.dto.ts` — discriminated union por `status`:
  - `FINISHED`: id, status, + todos os campos de `feedbackDoc` (gradeC1-C5, feedbackC1-C5), createdAt
  - `PENDING`: id, status, createdAt
  - `ERROR`: id, status, createdAt
  - Usa `dateToIsoString` para datas, `.meta({ id: '...' })` em cada schema

- [ ] Criar DTOs de correction

---

## Task 9: User Essay Repository Extensions

Adicionar métodos ao `user-essay.repository.ts`:

- `getUserEssayWithCorrections(essayId)` — findUnique com include `aiCorrections` → `feedback`, ordenado por `createdAt desc`
- `createAICorrection(essayId, text)` — cria `EssayFeedback` com defaults (grades 0, feedbacks vazios), depois cria `AICorrection` com status `PENDING`
- `findAICorrectionById(correctionId)` — findUnique com include `feedback`
- `updateAICorrectionToFinished(correctionId, feedbackData)` — atualiza o EssayFeedback com os dados da correção e muda status para `FINISHED`
- `updateAICorrectionStatus(correctionId, status)` — atualiza apenas o status
- `deleteAICorrection(correctionId)` — deleta correction + feedback associado
- `getActiveCorrectionCount(essayId)` — count de corrections com status `PENDING`

Atualizar `getUserEssayResponseSchema` para incluir campo `corrections: z.array(aiCorrectionResponseSchema).optional()`.

> **Nota:** Verificar o nome exato do model Prisma para `AICorrection` após `prisma:generate` — pode ser `aICorrection` no client.

- [ ] Adicionar métodos de correction no repository
- [ ] Atualizar DTO de response para incluir corrections

---

## Task 10: AI Correction Queue + Worker

### Queue (`essay-correction.queue.ts`):
- Injeta `@InjectQueue(ESSAY_CORRECTION_QUEUE)`
- `addCorrectionJob(data)` — adiciona job com `jobId: correctionId`
- `getJob(correctionId)`, `removeJob(correctionId)`

### Worker (`essay-correction.worker.ts`):
- Injeta `REDIS_CLIENT`, `AI_PROVIDER`, `EventEmitter2`
- Cria Worker manualmente no `onModuleInit` com conexão Redis duplicada
- **Lógica de processamento:**
  1. Chama `checkModelAvailability` para o modelo primário
  2. Se primário indisponível, verifica fallback
  3. Se ambos indisponíveis, emite `correction.ai.delayed` e throws
  4. Chama `aiProvider.generateObject()` com `feedbackDoc` schema e system prompt (o provider já tem lógica internal de primary → fallback)
  5. Em caso de sucesso, emite `correction.ai.completed` com `CorrectionCompletedPayload`
  6. Em caso de 503, marca modelo como unavailable; em caso de 429, emite `correction.ai.delayed`
- **Backoff:** exponencial `min(2^attempts * 2000, 120000)`, max 10 tentativas
- **On failed permanente:** emite `correction.ai.persisted` com status ERROR

### Correction Completed Listener (`correction-completed.listener.ts`):
- Escuta `correction.ai.completed`, persiste resultado via `repository.updateAICorrectionToFinished`

### Correction SSE Manager (`sse-connections.manager.ts`):
- Igual ao notification SSE manager mas key é `essayId`

### Correction SSE Listener (`correction-sse.listener.ts`):
- Escuta `correction.ai.persisted` → push `ESSAY_CORRECTED` event
- Escuta `correction.ai.delayed` → push `CORRECTION_DELAYED` event

- [ ] Criar queue wrapper
- [ ] Criar worker com lógica primary → fallback
- [ ] Criar correction-completed listener
- [ ] Criar correction SSE manager
- [ ] Criar correction SSE listener

---

## Task 11: User Essay Service

Implementar os 4 stubs methods + atualizar `get`:

- `correct(essayId, dto, studentId)` — valida ownership, verifica se já tem correction pendente (ConflictException), cria AICorrection no DB, adiciona job na fila
- `listenCorrection(essayId, studentId)` — cria Subject, registra no SSE manager, merge com heartbeat, map para MessageEvent, finalize para cleanup
- `deleteCorrection(essayId, correctionId, studentId)` — valida ownership, remove job da fila, deleta correction do DB
- `retryCorrection(essayId, correctionId, studentId)` — valida ownership, verifica se correction está em ERROR, verifica se job está failed, chama `job.retry()` e atualiza status para PENDING
- `get(userEssayId, studentId)` — buscar com corrections, formatar no shape do DTO (discriminated union por status)

- [ ] Implementar 4 stubs + atualizar `get`

---

## Task 12: User Essay Controller

Substituir stubs por endpoints decorados:

- `POST /user-essay/:id/correct` — body `CorrectEssayDto`, `@ZodResponse` com `NullResponseDto`
- `@Sse /user-essay/:id/correction/listen` — retorna `Observable<MessageEvent>`
- `DELETE /user-essay/:id/correction/:correctionId` — `@ZodResponse` com `GenericSuccessResponseDto`
- `POST /user-essay/:id/correction/:correctionId/retry` — `@ZodResponse` com `GenericSuccessResponseDto`

Todos com `@ApiBearerAuth()`, `@Session()`, `@ApiOperation()` com descrição, params via `@Param()`.

- [ ] Implementar 4 endpoints de correction no controller

---

## Task 13: User Essay Module

Wire all new providers: `EssayCorrectionQueue`, `EssayCorrectionWorker`, `CorrectionCompletedListener`, `CorrectionSseListener`, `CorrectionSseConnectionsManager` no array de providers.

- [ ] Atualizar `user-essay.module.ts`

---

## Task 14: Verify Build + Lint

- [ ] `pnpm prisma:generate` — verificar nomes exatos dos models no client gerado
- [ ] `pnpm lint` — corrigir com `pnpm lint:fix` se necessário
- [ ] `pnpm build` — corrigir erros de tipo. Atenção a: nomes Prisma, import paths, imports do `@Sse()`

---

## Task 15: Update Checklist

- [ ] Marcar como completas em `incita-refactor-struct.md`: fases 2.5, 2.9, 3.7, 3.8

---

## Diferenças do Sistema Antigo (intencionais)

| Aspecto | Antigo (essayer-server-old) | Novo |
|---------|----------------------------|------|
| Modelos AI | Dual: gemini-2.5-pro + gemini-2.5-flash com toggle Redis | Primary: gemini-3-flash-preview, Fallback: gemini-2.5-pro |
| Rate limiting | Toggle manual entre modelos | Auto-fallback com marcação de unavailable por TTL |
| Nomenclatura | Português (tipoNotificacao, tarefaId) | Inglês (type, activityId) |
| SSE events | Português (TarefaEnviada, RedacaoCorrigida) | Inglês (ACTIVITY_SENT, ESSAY_CORRECTED) |
| Notification model | MongoDB discriminators | PostgreSQL com typed relation tables |
| Correction model | Subdocument array (MongoDB) | Tabela separada com relation (Prisma) |
| Feedback creation | Apenas ao completar correção | Pre-criado com defaults, atualizado ao completar |

---

## Grafo de Dependência

```
Task 1 (Schema)
    |
    v
Task 2 (BullMQ) -----> Task 10 (Queue+Worker) --+
Task 3 (AI Module) --/                            |
    |                                            v
    +----> Task 4 (Notif DTOs+Repo)          Task 11 (Essay Service)
    |          |                                  |
    |          v                                  v
    |     Task 5 (Notif SSE+Listener)        Task 12 (Essay Controller)
    |          |                                  |
    |          v                                  v
    |     Task 6 (Notif Service+Ctrl)         Task 13 (Module)
    |          |                                  |
    |          v                                  v
    |     Task 7 (Wire Events)               Task 14 (Build+Lint)
    |                                             |
    +---------------------------------------------+
    |
    v
Task 15 (Checklist)
```

Tasks 2 e 3 podem ser feitas em paralelo. Tasks 4-7 podem ser feitas em paralelo com Tasks 8-9.
