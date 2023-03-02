import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  ParseIntPipe,
  UseGuards,
  Query,
  Request
} from '@nestjs/common';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    ) {}

  @Get()
  getUserByToken(@Request() req) {
    return this.usersService.getUserInformation(req.user);
  }
}
