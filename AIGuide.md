# Guia de Desenvolvimento com IA para o Projeto Essayer

Este documento serve como um guia para IAs, fornecendo diretrizes e padrões para o desenvolvimento de novas funcionalidades e manutenção do código-fonte do backend do projeto **Essayer**.

---

## 1. Visão Geral do Projeto

O **Essayer** é uma aplicação que utiliza uma arquitetura moderna e robusta para fornecer uma **API RESTful**.
O objetivo é manter um código **limpo, organizado, performático e de fácil manutenção**.

**Tecnologias Principais:**

- **Servidor Web:** Fastify
- **Validação de Schemas:** Zod com `fastify-type-provider-zod`
- **ODM (Object-Document Mapper):** Mongoose (MongoDB)
- **Linguagem:** TypeScript

---

## 2. Princípio Fundamental: Análise do Código Existente

**Aviso para a IA:** Antes de criar ou modificar qualquer código, é **essencial** que você leia os arquivos relevantes da funcionalidade em que está trabalhando e do diretório `shared`. Analise o código atual para entender os padrões, a lógica de negócio e as estruturas de dados já implementadas. Isso garante que suas contribuições sejam consistentes e se integrem perfeitamente ao projeto existente.

---

## 3. Arquitetura

O projeto segue uma arquitetura baseada em **funcionalidades (feature-based)**, com clara separação de responsabilidades.

- **./src/features/{funcionalidade}:** Lógica de uma funcionalidade específica (ex: `Repertorios`, `Auth`).
- **./src/shared/...:** Código reutilizável entre múltiplas funcionalidades (middlewares, configurações, serviços compartilhados, etc).

---

## 4. Estrutura de Arquivos e Convenções de Nomenclatura

- Nomes de arquivos em **PascalCase**.
- Controllers e Services concentram todas as suas ações relacionadas em um **único arquivo**.

```
src
├── features
│   └── MinhaFeature
│       ├── Controllers
│       │   └── MinhaFeatureController.ts // Agrupa todas as ações do controller
│       ├── Helpers
│       │   └── MeuHelper.ts
│       ├── Models
│       │   └── MeuModel.ts
│       ├── Routes.ts
│       ├── Schemas
│       │   └── MeuSchema.ts
│       ├── Services
│       │   └── MeuService.ts // Agrupa toda a lógica de negócio do service
│       ├── Types.ts
│       └── Validations
│           └── MinhaFeatureValidation.ts
└── shared
    ├── controllers
    ├── middlewares
    ├── models
    ├── plugins
    ├── schemas
    ├── services
    ├── templates
    ├── validations
    ├── Errors.ts
    ├── Routes.ts
    ├── Types.ts
    └── Utils.ts
```

---

## 5. Padrões de Código por Camada

### 5.1 Rotas (`Routes.ts`)

- Ponto de entrada da aplicação.
- Conectam endpoints HTTP a um **Controller** e aplicam os **Schemas de validação**.
- Utilizar `fastify-plugin` para registrar as rotas.
- Associar **schema de validação** + **controller**.
- Usar `preHandler` para autenticação/autorização (`authMiddleware`, `authProfessor`, `authAdmin`).
- Agrupar rotas por entidade.

**Exemplo:**
`src/features/Repertorios/Routes.ts`
```ts
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { RepertorioSchema } from './Schemas/RepertorioSchema';
import { RepertorioController } from './Controllers/RepertorioController';
import { authPlugin } from '../../shared/plugins/auth';

export const RepertorioRoutes: FastifyPluginAsyncZod = async (app) => {
  app.register(authPlugin);

  app.get('/', RepertorioSchema.getAll, RepertorioController.getAll);
  app.delete('/:id', RepertorioSchema.delete, RepertorioController.deleteById);
  // ... outras rotas
};
```

---

### 5.2 Schemas (`Schemas/`)

- Definem estrutura de dados para validação (body, query, params) e **serialização** das respostas.
- Criar schemas com **Zod**.
- Exportar um objeto `EntitySchema`.
- Reutilizar schemas genéricos de `src/shared`.
- Adicionar **summary** para Swagger.

**Exemplo:**
`src/features/Repertorios/Schemas/CitacaoSchema.ts`
```ts
import type { EntitySchema } from '../../../shared/Types';
import { genericError } from '../../../shared/Schemas';
import { createCitacaoBodyValidation, getCitacaoResponse } from '../Validations/CitacaoValidation';
import { idValidation } from '../../../shared/Validations';

export const CitacaoSchema: EntitySchema = {
  get: {
    schema: {
      params: idValidation,
      response: {
        200: getCitacaoResponse,
        404: genericError,
      },
      summary: 'Recupera citação selecionada',
    },
  },
  create: {
    // ...
  }
};
```

---

### 5.3 Controllers (`Controllers/`)

- Agrupam todas as ações relacionadas à entidade em um único arquivo (geralmente uma `class` ou `object`).
- Cada método lida com uma rota específica.
- Extrai dados da requisição (`params`, `body`, `user`) e os repassa para a camada de `Service`.
- Formata a resposta HTTP com base no retorno do `Service`.

**Exemplo:**
`src/features/Repertorios/Controllers/CitacaoController.ts`
```ts
import type { RouteHandlerMethod } from 'fastify';
import type { RequestUserData } from '../../../../shared/Types';
import { CitacaoService } from '../Services/CitacaoService';

class CitacaoController {
  public static get: RouteHandlerMethod = async (request, reply) => {
    const { id: citacaoId } = request.params as { id: string };
    const { id: userId } = (request.user as RequestUserData) || { id: null };

    const response = await CitacaoService.get(citacaoId, userId);
    if (!response.success) {
      return reply.status(response.status).send({ message: response.message });
    }

    reply.send(response.data);
  };

  public static create: RouteHandlerMethod = async (request, reply) => {
    // ...lógica para criar uma citação
  };
}

export { CitacaoController };
```

---

### 5.4 Services (`Services/`)

- Contêm a lógica de negócio da aplicação.
- Agrupam todas as operações relacionadas em um único arquivo.
- Interagem com os `Models` para acessar o banco de dados.
- **Sempre** devem retornar um objeto padronizado:
  - **Sucesso:** `{ success: true, data: any }`
  - **Erro:** `{ success: false, status: number, message: string }`

**Exemplo:**
`src/features/Repertorios/Services/CitacaoService.ts`
```ts
import { CitacaoModel } from '../Models/CitacaoModel';

class CitacaoService {
  public static async get(citacaoId: string) {
    const citacao = await CitacaoModel.findById(citacaoId);

    if (!citacao) {
      return {
        success: false,
        status: 404,
        message: `Citação com ID "${citacaoId}" não existe.`,
      };
    }

    return { success: true, data: citacao };
  }

  public static async create(data: any) {
    // ...lógica para criar uma citação no banco de dados
    const novaCitacao = await CitacaoModel.create(data);
    return { success: true, data: novaCitacao };
  }
}

export { CitacaoService };
```

---

### 5.5 Models (`Models/`)

- Definem a estrutura dos documentos no **MongoDB**.
- Usar `discriminator` do Mongoose para herança entre tipos de repertórios (`Obra`, `Artigo`, `Citacao`).
- Sempre incluir `timestamps: true` na configuração do Schema.

**Exemplo:**
`src/features/Repertorios/Models/CitacaoModel.ts`
```ts
import { Schema } from 'mongoose';
import { RepertorioModel } from './RepertorioModel';
import type { Citacao } from '../Types';

export const CitacaoModel = RepertorioModel.discriminator<Citacao>(
  'Citacao',
  new Schema({
    frase: { type: String, required: true },
    fonte: String,
  }),
);
```

---

### 5.6 Validações e Tipos (`Validations/` e `Types.ts`)

- Criar schemas Zod detalhados para validação de `body`, `params`, `query` e para serialização da `response`.
- Inferir os tipos TypeScript a partir dos schemas Zod para garantir tipagem forte e consistente.

**Exemplo de validação:**
`src/features/Repertorios/Validations/CitacaoValidation.ts`
```ts
import z from 'zod';

export const getCitacaoResponse = z.object({
  id: z.string(),
  frase: z.string(),
});

export const createCitacaoBodyValidation = z.object({
  frase: z.string({
    required_error: 'O campo frase é obrigatório.',
  }),
});
```

**Exemplo de tipos:**
`src/features/Repertorios/Types.ts`
```ts
import type { getCitacaoResponse, createCitacaoBodyValidation } from './Validations/CitacaoValidation';
import type z from 'zod';

export type CitacaoResponse = z.infer<typeof getCitacaoResponse>;
export type CreateCitacaoBody = z.infer<typeof createCitacaoBodyValidation>;
```

---

## 6. Boas Práticas e Performance

- **Código Limpo:** Mantenha o código legível, autoexplicativo e siga as convenções definidas no `biome.json`.
- **Performance:**
  - Use `.select()` nas queries do Mongoose para buscar apenas os campos necessários.
  - Utilize `Promise.all()` para executar operações de I/O independentes em paralelo.
- **Tratamento de Erros:**
  - Utilize o `appErrorHandler` para um tratamento de erros global e consistente.
  - Retorne objetos de erro claros e padronizados da camada de `Service`.
- **Segurança:**
  - Valide **todas** as entradas do cliente (body, params, query) usando **Zod**.
  - Garanta que as rotas protegidas tenham os `preHandlers` de autorização apropriados (`authAdmin`, `authProfessor`, etc.).