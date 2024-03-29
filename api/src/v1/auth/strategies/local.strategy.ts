import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import * as helper from '../../helpers/response';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.authentication(email, password);
    if (!user) {
      throw new ForbiddenException();
    }

    return user;
  }
}
