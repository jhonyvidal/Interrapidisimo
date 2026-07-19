import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('DB_PATH', join(process.cwd(), 'catalogo.sqlite')),
        autoLoadEntities: true,
        // synchronize es aceptable en un take-home sin migraciones formales;
        // en un entorno productivo esto se reemplazaria por migraciones versionadas.
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
