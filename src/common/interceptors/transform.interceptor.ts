import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';
import { Response } from 'express';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  public intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((resData: unknown): ApiResponseDto<T> => {
        // If handler already returned an object with a custom message
        if (resData && typeof resData === 'object' && 'message' in resData && 'data' in resData) {
          const customRes = resData as { message: string; data: T };
          return {
            success: true,
            statusCode,
            message: customRes.message,
            data: customRes.data,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          statusCode,
          message: 'Operation successful',
          data: resData as T,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
