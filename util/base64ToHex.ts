export const base64ToHex = (base64: string) => {
    // 1. Base64 解码为二进制字符串
    const raw = atob(base64)
    
    // 2. 将每个字符的 ASCII 码转换为十六进制
    let hex = ''
    for (let i = 0; i < raw.length; i++) {
      const byte = raw.charCodeAt(i)
      hex += byte.toString(16).padStart(2, '0')
    }
    
    return hex;
}