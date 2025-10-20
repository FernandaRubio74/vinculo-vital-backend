import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interest } from '../../users/entities/interest.entity';
import { interestsSeedData } from './interests.seed';

@Injectable()
@Command({ 
  name: 'seed:interests', 
  description: 'Insertar intereses iniciales en la base de datos' 
})
export class SeedInterestsCommand extends CommandRunner {
  constructor(
    @InjectRepository(Interest)
    private interestsRepository: Repository<Interest>,
  ) {
    super();
  }

  async run(): Promise<void> {
    console.log('Iniciando seed de intereses...\n');

    const existingCount = await this.interestsRepository.count();

    if (existingCount > 0) {
      console.log(`ya están ${existingCount} intereses en la base de datos.`);
      console.log('¿Deseas continuar? Esto agregará nuevos intereses sin duplicar.\n');
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const interestData of interestsSeedData) {
      // Verificar si ya existe
      const existing = await this.interestsRepository.findOne({
        where: { name: interestData.name },
      });

      if (existing) {
        skippedCount++;
        console.log(`⏭️  Omitido: ${interestData.name} (ya existe)`);
        continue;
      }

      // Insertar nuevo interés
      const interest = this.interestsRepository.create(interestData);
      await this.interestsRepository.save(interest);
      insertedCount++;
      console.log(`Insertado: ${interestData.name} (${interestData.category})`);
    }

    console.log('\n Resumen:');
    console.log(`   Intereses insertados: ${insertedCount}`);
    console.log(`   Intereses omitidos: ${skippedCount}`);
    console.log(`   Total en BD: ${await this.interestsRepository.count()}`);
    console.log('\n ¡Seed completado!\n');
  }
}