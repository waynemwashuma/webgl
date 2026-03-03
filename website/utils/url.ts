import { resolve } from "node:path";

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;

  console.log(import.meta.env);
  
  
  if(base){
    return resolve(base, path)
  }

  return path
}
