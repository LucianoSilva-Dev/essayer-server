# Essayer Server — Backend de Redações

Backend NestJS para o sistema de redações do Anglo Online, responsável por turmas, atividades, correções de professores e IA, repertórios e integração com a API Incita.

## Tecnologias

- **Runtime**: Node.js + NestJS
- **Banco de dados**: PostgreSQL via Prisma ORM
- **Autenticação**: Better Auth com plugins admin e API Key
- **Fila**: BullMQ + Redis
- **IA**: Integração com provedores para correção automática de redações
- **Storage**: R2/Cloudflare ou local

## Configuração

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm start:dev
```

## Conformidade LGPD

### Aceite dos Termos de Uso

O aceite é versionado e registrado no backend com metadados (IP, User-Agent, data).

| Endpoint | Método | Descrição |
|---|---|---|
| `/legal/terms/status` | GET | Verifica se o usuário aceitou a versão vigente |
| `/legal/terms/accept` | POST | Registra o aceite da versão vigente |

A versão atual está definida em `src/core/legal/legal.constants.ts`.

### Origens Confiáveis

O campo `trustedOrigins` no Better Auth agora utiliza a variável de ambiente `TRUSTED_ORIGINS` (lista separada por vírgula). Em produção, o wildcard `*` foi removido. Em desenvolvimento, as origens `localhost:3000` e `localhost:5173` são permitidas por padrão.

## Testes

```bash
pnpm prisma:generate
pnpm test
pnpm test:e2e
pnpm build
```
