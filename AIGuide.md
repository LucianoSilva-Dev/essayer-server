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

## 2. Arquitetura

O projeto segue uma arquitetura baseada em **funcionalidades (feature-based)**, com clara separação de responsabilidades.

- **./src/features/{funcionalidade}:** Lógica de uma funcionalidade específica (ex: `Repertorios`, `Auth`).  
- **./src/shared/...:** Código reutilizável entre múltiplas funcionalidades (middlewares, configurações, serviços compartilhados, etc).  

---

## 3. Estrutura de Arquivos e Convenções de Nomenclatura

- Nomes de arquivos em **PascalCase**.  
- Controllers e Services divididos em **arquivos de ação única** e depois agregados em um arquivo principal.

```
src
├── features
│   └── MinhaFeature
│       ├── Controllers
│       │   ├── Create.ts // Lógica para uma ação específica
│       │   ├── Get.ts    // Outra ação
│       │   └── MinhaFeatureController.ts // Agrupa e exporta as ações
│       ├── Helpers
│       │   └── MeuHelper.ts
│       ├── Models
│       │   └── MeuModel.ts
│       ├── Routes.ts
│       ├── Schemas
│       │   └── MeuSchema.ts
│       ├── Services
│       │   │   ├── Create.ts
│       │   │   └── Get.ts
│       │   └── MeuService.ts
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

## 4. Padrões de Código por Camada

### 4.1 Rotas (`Routes.ts`)

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

### 4.2 Schemas (`Schemas/`)

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

### 4.3 Controllers (`Controllers/`)

- Arquivos de **ação única**.  
- Arquivo agregador exporta todas as ações.  

**Exemplo de ação:**  
`src/features/Repertorios/Controllers/GetCitacao.ts`
```ts
import type { RouteHandlerMethod } from 'fastify';
import type { RequestUserData } from '../../../../shared/Types';
import { CitacaoService } from '../../Services/CitacaoService';

export const getCitacao: RouteHandlerMethod = async (request, reply) => {
  const { id: citacaoId } = request.params as { id: string };
  const { id: userId } = (request.user as RequestUserData) || { id: null };

  const response = await CitacaoService.get(citacaoId, userId);
  if (!response.success) {
    return reply.status(response.status).send({ message: response.message });
  }

  reply.send(response.data);
};
```

**Exemplo de agregador:**  
`src/features/Repertorios/Controllers/CitacaoController.ts`
```ts
import { get } from './Get';
import { create } from './Create';

export const CitacaoController = {
  get,
  create,
};
```

---

### 4.4 Services (`Services/`)

- Lógica de negócio, separados em ações e agregados.  
- Sempre retornar:
  - **Sucesso:** `{ success: true, data: any }`  
  - **Erro:** `{ success: false, status: number, message: string }`  

**Exemplo de ação:**  
`src/features/Repertorios/Services/GetService.ts`
```ts
import { CitacaoModel } from '../../Models/CitacaoModel';

export const get = async (citacaoId: string) => {
  const citacao = await CitacaoModel.findById(citacaoId);

  if (!citacao) {
    return {
      success: false,
      status: 404,
      message: `Citação com ID "${citacaoId}" não existe.`,
    };
  }

  return { success: true, data: citacao };
};
```

**Exemplo de agregador:**  
`src/features/Repertorios/Services/CitacaoService.ts`
```ts
import { create } from './Create';
import { get } from './Get';

export const CitacaoService = {
  create,
  get,
};
```

---

### 4.5 Models (`Models/`)

- Definem estrutura dos documentos no **MongoDB**.  
- Usar `discriminator` para herança entre repertórios (`Obra`, `Artigo`, `Citacao`).  
- Sempre incluir `timestamps: true`.  

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

### 4.6 Validações e Tipos (`Validations/` e `Types.ts`)

- Criar schemas Zod detalhados (body, response).  
- Tipos inferidos dos schemas para tipagem forte.

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

## 5. Boas Práticas e Performance

- **Código Limpo:** Legível, autoexplicativo, seguindo convenções do `biome.json`.  
- **Performance:**  
  - Usar `.select()` no Mongoose para buscar apenas campos necessários.  
  - Usar `Promise.all()` para rodar operações em paralelo.  
- **Tratamento de Erros:**  
  - Usar `appErrorHandler` para erros consistentes.  
  - Retornar objetos de erro claros dos Services.  
- **Segurança:**  
  - Validar todas entradas com **Zod**.  
  - Garantir autorização via **preHandlers**.  

---
