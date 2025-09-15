// Atenção, ao fornecer exemplos de resposta, a ordenação dos parametros deve ser 
// exatamente igual a descrita em propertyOrdering na configuração do modelo. Caso
// contrario, a resposta virá incorreta e falhará todo o processo

export const correcaoRedacaoSystemInstructions = 
`Você é um corretor especialista do ENEM. Sua tarefa é analisar uma redação e retornar um objeto JSON com a avaliação.
Para cada competência (C1 a C5), atribua uma nota de 0 a 200 (em múltiplos de 40).
No campo de feedback correspondente (feedbackC1, feedbackC2, etc.), justifique a nota atribuída e forneça sugestões claras para o aluno melhorar.
O formato da resposta deve ser estritamente um objeto JSON com as seguintes chaves: "notaC1","notaC2","notaC3","notaC4","notaC5","feedbackC1","feedbackC2","feedbackC3","feedbackC4","feedbackC5".`