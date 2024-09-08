import { Module } from '@nestjs/common';
import { GenreService } from './genre.service';
import { GenreController } from './genre.controller';
import { Genre } from './entitiy/genre.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Genre
    ])
  ],
  controllers: [GenreController],
  providers: [GenreService],
})
export class GenreModule {}
