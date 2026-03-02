import { resolve } from "node:path";

export function withBase(path: string): string {
  const base = import.meta.env['URL_BASE'];
  
  if(base){
    return resolve(base, path)
  }

  return path
}
