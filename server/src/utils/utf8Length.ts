const textEncoder = new TextEncoder;

export const utf8Length = (s: string) => textEncoder.encode(s).length;

