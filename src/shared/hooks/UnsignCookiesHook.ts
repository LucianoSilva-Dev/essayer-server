import type { onRequestHookHandler } from 'fastify';

export const unsignCookiesHook: onRequestHookHandler = async (request) => {
  const originalCookies = { ...request.cookies };
  for (const cookieName in originalCookies) {
    if (Object.hasOwn(originalCookies, cookieName)) {
      const signedValue = originalCookies[cookieName];
      if (signedValue) {
        try {
          const unsigned = request.unsignCookie(signedValue);

          if (unsigned.valid && unsigned.value !== null) {
            request.cookies[cookieName] = unsigned.value;
            request.log.info(
              `Hook: Cookie '${cookieName}' dessinado com sucesso.`,
            );
          } else if (!unsigned.valid && signedValue === unsigned.value) {
            request.log.debug(
              `Hook: Cookie '${cookieName}' não parece estar assinado ou assinatura inválida. Mantendo valor original.`,
            );
          } else {
            console.warn(
              `Hook: Assinatura inválida detectada para o cookie '${cookieName}'. Removendo cookie da requisição.`,
            );
            delete request.cookies[cookieName];
          }
        } catch (err) {
          console.error(
            `Hook: Erro inesperado ao tentar dessinar o cookie '${cookieName}':`,
            err,
          );
          delete request.cookies[cookieName];
        }
      }
    }
  }
};
