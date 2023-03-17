import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, IsNull, Repository } from 'typeorm';
import * as moment from 'moment';
import * as bcrypt from 'bcrypt';
const crypto = require('crypto');
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { User } from '../entities/users.entity';
import * as helper from '../helpers/response';
dotenv.config();
import { set } from '../utils/redis';
import { RequestUser } from '../interfaces/req.user.interface';
@Injectable()
export class AuthService {
  constructor(
    // private userService: UsersService,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async authentication(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { email: email },
    });

    if (!user) return false;

    const check = await bcrypt.compare(password, user.password);

    if (!check) return false;

    return user;
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  async login(user: User) {
    try {
      const payload: RequestUser = {
        name: user.name,
        email: user.email,
        id: user.id,
        role: user.role,
      };

      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
        },
      });
      const expiresTime = process.env.EXPIRES_TIME;

      const splitEx = expiresTime.slice(0, 2);

      const ex = parseInt(splitEx) * 60 * 60 * 24;

      const token = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: ex || 2592000,
      });
      await set(token, publicKey, ex || 2592000);
      return helper.success({
        expiresIn: moment().add(
          expiresTime.slice(0, expiresTime.length - 1),
          'days',
        ),
        access_token: token,
      });
    } catch (error) {
      console.error(error);
      return helper.error(error, 'report.auth.login');
    }
  }
}
