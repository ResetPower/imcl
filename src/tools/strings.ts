export function removePrefix(src: string, pre: string): string {
  return src.startsWith(pre) ? src.substr(pre.length, src.length) : src;
}

export function removeSuffix(src: string, suf: string): string {
  return src.endsWith(suf) ? src.substr(0, src.length - suf.length) : src;
}