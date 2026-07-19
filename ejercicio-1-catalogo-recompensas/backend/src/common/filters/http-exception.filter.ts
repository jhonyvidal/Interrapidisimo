import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'http';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

// Uniforma cualquier error (HttpException de Nest o excepcion no controlada)
// a un mismo cuerpo de respuesta, para que el frontend siempre sepa donde
// buscar el mensaje sin importar que capa lo lanzo.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const raw = exception.getResponse();
      const { message, error } = this.parseHttpExceptionBody(raw, statusCode);

      response.status(statusCode).json(this.buildBody(statusCode, message, error, request.url));
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : exception);
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(this.buildBody(HttpStatus.INTERNAL_SERVER_ERROR, 'Error interno del servidor', 'Internal Server Error', request.url));
  }

  private parseHttpExceptionBody(raw: unknown, statusCode: number): { message: string | string[]; error: string } {
    const reasonPhrase = STATUS_CODES[statusCode] ?? 'Error';
    if (typeof raw === 'string') {
      return { message: raw, error: reasonPhrase };
    }
    if (raw && typeof raw === 'object') {
      const body = raw as Record<string, unknown>;
      return {
        message: (body.message as string | string[]) ?? reasonPhrase,
        error: (body.error as string) ?? reasonPhrase,
      };
    }
    return { message: reasonPhrase, error: reasonPhrase };
  }

  private buildBody(statusCode: number, message: string | string[], error: string, path: string): ErrorBody {
    return { statusCode, message, error, timestamp: new Date().toISOString(), path };
  }
}
