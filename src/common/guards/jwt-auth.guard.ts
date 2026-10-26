import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';
import { AUTH_MESSAGES } from '../constants/messages.constant';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  public override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  public override handleRequest<TUser = unknown>(
    err: unknown,
    user: unknown,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err instanceof Error) {
      throw err;
    }
    if (typeof err === 'string') {
      throw new UnauthorizedException(err);
    }
    if (err) {
      throw new UnauthorizedException(AUTH_MESSAGES.CREDENTIALS_INVALID);
    }
    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.CREDENTIALS_MISSING);
    }
    return user as TUser;
  }
}
