import { DateTime } from 'luxon';

export function getNextLimitResetTimestampSeconds() {
  const nowPacific = DateTime.now().setZone("America/Los_Angeles");
  const nextMidnightPacific = nowPacific.plus({ days: 1 }).startOf("day");
  return nextMidnightPacific.toSeconds();
}