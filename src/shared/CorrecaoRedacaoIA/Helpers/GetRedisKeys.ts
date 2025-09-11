export function getModelReqCountKey (modelName: string) {
    return `${modelName}:req:count`
}

export function getCurrentModelNameKey() {
    return 'gemini:models:current'
}