import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import * as helper from '../helpers/response'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,


  ) {
  }
   async getUserInformation(user) {
    try {
      const { id } = user

      const data = await this.usersRepository.findOneBy({ id: id })
      delete data.password
      return helper.success(data)
    } catch (error) {
      console.error(error)
      return helper.error(error)
    }
  }
}