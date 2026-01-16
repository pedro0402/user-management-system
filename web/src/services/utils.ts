export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function validateName(value: string) {
    if (!value.trim()) return "O nome é obrigatório";
    if (value.trim().length < 3) return "O nome deve ter no minímo 3 caracteres";
    if (value.trim().length > 30) return "O nome deve ter no máximo 30 caracteres";
    return null;
}

export function validateUrl(value: string) {
    const v = value.trim();

    if(!v) return null;

    try {
        const url = new URL(v);
        if (url.protocol !== 'http:' && url.protocol !== 'https:'){
            return "A URL deve iniciar com http:// ou https://";
        }
        return null;
    }  catch {
        return "URL inválida"
    }
}