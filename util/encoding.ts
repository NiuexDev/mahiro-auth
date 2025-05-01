export const base64ToHex = (base64: string) => {
    // 1. Base64 解码为二进制字符串
    const raw = atob(base64)
    console.log(raw)

    // 2. 将每个字符的 ASCII 码转换为十六进制
    let hex = ''
    for (let i = 0; i < raw.length; i++) {
        const byte = raw.charCodeAt(i)
        hex += byte.toString(16).padStart(2, '0')
    }

    return hex
}

const HANZI_START_CODEPOINT = 0x5030 // 汉字“一”的 Unicode 编号

export const base64ToCJKC = (base64: string) => {
    const binaryString = atob(base64)
    const len = binaryString.length

    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }

    let hanziResult = ""
    bytes.forEach(byte => {
        const mappedCodepoint = byte + HANZI_START_CODEPOINT
        hanziResult += String.fromCodePoint(mappedCodepoint)
    })
    return hanziResult
}


export const CJKCToUint8Array = (hanziStr: string) => {
    const charsArray = Array.from(hanziStr)
    const bytes = new Uint8Array(16)

    charsArray.forEach((char, index) => {
        bytes[index] = char.codePointAt(0)! - HANZI_START_CODEPOINT
    })
    return bytes
}