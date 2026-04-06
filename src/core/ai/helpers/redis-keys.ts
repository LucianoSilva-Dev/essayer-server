export function getModelRpdKey(modelName: string): string {
  return `${modelName}:rpd`;
}

export function getModelRpmKey(modelName: string): string {
  return `${modelName}:rpm`;
}

export function getModelUnavailableKey(modelName: string): string {
  return `${modelName}:unavailable`;
}
