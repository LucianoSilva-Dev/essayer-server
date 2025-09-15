export function getModelRPDKey (modelName: string) {
    return `${modelName}:rpd`
}

export function getModelRPMKey(modelName: string) {
    return `${modelName}:rpm`;
}

export function getModelUnavailableKey(modelName: string) {
    return `${modelName}:unavailable`;
  }

export function getCurrentModelNameKey() {
    return 'gemini:models:current'
}