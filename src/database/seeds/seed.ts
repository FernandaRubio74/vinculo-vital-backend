import { CommandFactory } from 'nest-commander';
import { SeedModule } from './seed.module';

async function bootstrap() {
  await CommandFactory.run(SeedModule);
}

bootstrap();