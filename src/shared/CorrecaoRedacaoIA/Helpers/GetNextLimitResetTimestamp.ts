import { toDate } from 'date-fns-tz';
import { addDays, set } from 'date-fns';

// Função para calcular o timestamp da próxima meia-noite no Pacífico
function getNextLimitResetTimestampSeconds(): number {
    const timeZone = 'America/Los_Angeles';
    
    const nowInPacific = toDate(new Date(), { timeZone });
    const tomorrowInPacific = addDays(nowInPacific, 1);
    const nextMidnightInPacific = set(tomorrowInPacific, {
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
    });
    
    // Retorna timestamp unix convertido para segundos
    return nextMidnightInPacific.getTime() / 1000;
}