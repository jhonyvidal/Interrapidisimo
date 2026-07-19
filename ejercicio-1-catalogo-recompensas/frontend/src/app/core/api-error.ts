import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
}

export function extractErrorMessage(err: HttpErrorResponse): string {
  const body = err.error as ApiErrorBody | undefined;
  if (!body?.message) {
    return 'Ocurrio un error inesperado. Intenta de nuevo.';
  }
  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
}
