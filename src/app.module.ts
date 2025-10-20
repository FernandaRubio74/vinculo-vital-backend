import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module'; 
import { MatchingModule } from './matching/matching.module';
import { ConnectionsModule } from './connections/connections.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    MatchingModule,
    // para que las variables sean las de env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de base de datos
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      autoLoadEntities: true,
    }),

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    ConnectionsModule,
    SessionsModule,
  ],
})
export class AppModule {}