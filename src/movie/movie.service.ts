import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { DataSource, In, Like, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ){ }


  async getManyMovies(title?: string){
    if(!title){
      // return this.movies;
      return [
        await this.movieRepository.find({
            relations: ['detail', 'director', 'genres'],
           }),
        await this.movieRepository.count()
      ];
    }
    // return this.movies.filter(movie => movie.title.includes(title));
    // return this.movies.filter(movie => movie.title.startsWith(title));
    return this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`),
      },
      relations: ['detail', 'director', 'genres'],
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

    const director = await this.directorRepository.findOne({
      where: { id: createMovieDto.directorId },
    });

    if(!director){
      throw new NotFoundException(`Director with ID ${createMovieDto.directorId} not found`);
    }

    const genres = await this.genreRepository.find({
      where: {
        id: In(createMovieDto.genreIds),
      },
    });

    if(genres.length !== createMovieDto.genreIds.length){
      throw new NotFoundException('Some genres not found ids => ' 
        + createMovieDto.genreIds.filter(
            id => !genres.map(genre => genre.id)
            .includes(id)
          )
      );
    }
    
    // const movieDetail = await this.movieDetailRepository.save({
    //   detail: createMovieDto.detail,
    // })
    // const movieDetailId = movieDetail.id;

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      detail: {
        detail: createMovieDto.detail,
      },
      // genre: createMovieDto.genre,
      director: director,
      // director: {
      //   id: createMovieDto.directorId,
      // },
      // genres: createMovieDto.genreIds.map(id => ({ id })),
      genres: genres,
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

  async updateMovie(id: string, updateMovieDto: UpdateMovieDto){
    // const movie = this.movies.find(movie => movie.id === +id);

    const movie = await this.movieRepository.findOne({
      where: { id: +id },
      relations: ['detail', 'director', 'genres'],
    })

    if(!movie){
      throw new NotFoundException(`Movie with ID ${id} not found`); 
    }

    const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

    let newDirector;

    if( directorId ){
      const director = await this.directorRepository.findOne({
        where: { id: directorId },
      });

      if(!director){
        throw new NotFoundException(`Director with ID ${directorId} not found`);
      }

      newDirector = director; 
    }

    let newGenres;

    if( genreIds ){
      const genres = await this.genreRepository.find({
        where: {
          id: In(genreIds),
        },
      });

      if(genres.length !== genreIds.length){
        throw new NotFoundException('Some genres not found ids => ' 
          + genreIds.filter(
              id => !genres.map(genre => genre.id)
              .includes(id)
            )
        );
      }

      newGenres = genres;
    }


    if( detail ){
      await this.movieDetailRepository.update({ id: movie.detail.id }, { detail });
    }

    // movie.title = updateMovieDto.title;
    // movie.year = updateMovieDto.year;

    // Object.assign(movie, updateMovieDto);
    // return movie;

    const movieUpdateFields = {
      ...movieRest,
      ...(newDirector && { director: newDirector }),
    }

    await this.movieRepository.update(
      { id: +id }, 
      movieUpdateFields,
    );

    
    const newMovie = await this.movieRepository.findOne({
      where: { id: +id },
      relations: ['detail', 'director', 'genres'],
    })

    newMovie.genres = newGenres;

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
      relations: ['detail', 'director', 'genres'],
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
