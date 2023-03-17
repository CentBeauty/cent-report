import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';
import { Headers } from '@nestjs/common';
import { deleteKey } from '../utils/redis';
@Controller('auth')
export class AuthController {
  constructor(
    // private userService: UsersService,
    private authService: AuthService, // private CustomersService: CustomersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() request) {
    return this.authService.login(request.user);
  }

  @Post('/logout')
  async getUserLogout(
    @Response() response,
    @Headers() headers,
  ): Promise<Response> {
    let { authorization } = headers;
    authorization = authorization.replace('Bearer ', '');
    await deleteKey(authorization);
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    response.clearCookie('access_token');
    response.clearCookie('token');
    return response.sendStatus(200);
  }
}
