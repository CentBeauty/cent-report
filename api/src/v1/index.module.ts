import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ReportModule } from './report/reports.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'reports',
        module: ReportModule,
      },
    ]),
    AuthModule,
    UsersModule,
    ReportModule
  ],
  providers: [],

})

export class ModuleV1 { }
