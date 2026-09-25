/**
 * Tipos minimos de los bindings de Cloudflare que usamos.
 *
 * No se usa `wrangler types` completo a proposito: sus tipos globales del
 * runtime de Workers chocan con los tipos DOM de los scripts del navegador.
 * Si sumas un binding en wrangler.jsonc, declaralo aqui.
 */
declare module 'cloudflare:workers' {
  interface R2ObjectBody {
    body: ReadableStream;
    httpEtag: string;
    writeHttpMetadata(headers: Headers): void;
  }

  interface R2Bucket {
    put(
      key: string,
      value: ReadableStream | ArrayBuffer | string,
      opciones?: { httpMetadata?: { contentType?: string } },
    ): Promise<unknown>;
    get(key: string): Promise<R2ObjectBody | null>;
    delete(keys: string | string[]): Promise<void>;
    list(opciones?: { prefix?: string; cursor?: string }): Promise<{
      objects: { key: string }[];
      truncated: boolean;
      cursor?: string;
    }>;
  }

  export const env: { MEDIOS: R2Bucket };
}
