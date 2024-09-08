import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { In, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entitiy/director.entity';
import { Genre } from 'src/genre/entitiy/genre.entity';


@Injectable()
export class MovieService {

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,

  ){ }


  async getManyMovies(title?: string){
    if(!title){
      // return this.movies;
      if(!title){
        return [
          await this.movieRepository.find({
             relations: ['director', 'genres'] }),
          await this.movieRepository.count()
        ];
      }
    }
    // return this.movies.filter(movie => movie.title.includes(title));
    // return this.movies.filter(movie => movie.title.startsWith(title));
    return this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`),
      },
      relations: ['director', 'genres'],
    });

  }

  async getOneMovie(id: string){

    // const movie = this.movies.find(movie => movie.id === +id);
    const movie = await this.movieRepository.findOne({
      where: { id: +id },
      relations: ['detail', 'director', 'genres'],
    })
    
    if(!movie){
      throw new NotFoundException(`Movie with ID ${id} not found`); 
    }
    return movie;
  }

  async postMovie(createMovieDto: CreateMovieDto){

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      detail: {
        detail: createMovieDto.detail,
      },
      director: {
        id: createMovieDto.directorId,
      },
      genres: createMovieDto.genreIds.map(id => ({ id })),
    })

    return await this.movieRepository.findOne({
      where: { id: movie.id },
      relations: ['detail', 'director', 'genres'],
    })

    // const movie: Movie = {
    //   id: this.idCounter++,
    //   ...createMovieDto,
    // };
    // this.movies.push(movie);
    // return movie;
  }

  async patchMovie(id: string, updateMovieDto: UpdateMovieDto){
    // const movie = this.movies.find(movie => movie.id === +id);

    const movie = await this.movieRepository.findOne({
      where: { id: +id },
      relations: ['detail', 'genres'],
    })

    if(!movie){
      throw new NotFoundException(`Movie with ID ${id} not found`); 
    }

    const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

    // movie.title = updateMovieDto.title;
    // movie.year = updateMovieDto.year;

    // Object.assign(movie, updateMovieDto);
    // return movie;

    const movieUpdateFields = {
      ...movieRest,
    }

    await this.movieRepository.update({ id: +id }, movieUpdateFields);

    
    const newMovie = await this.movieRepository.findOne({
      where: { id: +id },
      relations: ['detail', 'director'],
    })

    // newMovie.genres = newGenres;

    await this.movieRepository.save(newMovie);


    return await this.movieRepository.findOne({
      where: { id: movie.id },
      relations: ['detail', 'director', 'genres'],
    })    
  }

  async deleteMovie(id: string){
    // const movie = this.movies.find(movie => movie.id === +id);
    // this.movies = this.movies.filter(movie => movie.id !== +id);

    const movie = await this.movieRepository.findOne({
      where: { id: +id },
      relations: ['detail']
    })

    if( !movie ){
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    await this.movieRepository.delete({ id: +id });

    // const movieIndex = this.movies.findIndex(movie => movie.id === +id);
    // if(movieIndex === -1){
    //   throw new NotFoundException(`Movie with ID ${id} not found`); 
    // }
    // this.movies.splice(movieIndex, 1);

    return id;
  }  
}
