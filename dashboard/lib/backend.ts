const BACKEND_URL     = process.env.BACKEND_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export class BackendError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "BackendError";
  }
}

export async function callBackend<T = unknown>(path: string, body: unknown): Promise<T> {
  if (!BACKEND_URL || !INTERNAL_API_KEY) {
    throw new BackendError(
      500,
      "BACKEND_URL o INTERNAL_API_KEY no configurados en Vercel. Verificar variables de entorno."
    );
  }

  const url = `${BACKEND_URL.replace(/\/$/, "")}${path}`;

  const res = await fetch(url, {
    method:  "POST",
    headers: {
      "Content-Type":   "application/json",
      "x-internal-key": INTERNAL_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new BackendError(res.status, text || `Backend error ${res.status}`);
  }

  return res.json() as Promise<T>;
}
