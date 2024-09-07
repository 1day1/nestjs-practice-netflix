import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';


@Injectable()
export class MovieService {

  private movies: Movie[] = [];

  private idCounter = 4;

  constructor(){
    const movie1 = new Movie();

    movie1.id = 1;
    movie1.title = 'Inception';
    movie1.year = 2010;
    movie1.genre = 'Sci-fi';

    const movie2 = new Movie();
    movie2.id = 2;
    movie2.title = 'Interstellar';
    movie2.year = 2014;
    movie2.genre = 'Sci-fi';

    const movie3 = new Movie();
    movie3.id = 3;
    movie3.title = 'Avengers';
    movie3.year = 2012;
    movie3.genre = 'Action';
   
    this.movies.push(movie1, movie2, movie3);
  }


  getManyMovies(title?: string){
    if(!title){
      return this.movies;
    }
    // return this.movies.filter(movie => movie.title.includes(title));
    return this.movies.filter(movie => movie.title.startsWith(title));

  }

  getOneMovie(id: string){
    const movie = this.movies.find(movie => movie.id === +id);
    if(!movie){
      throw new NotFoundException(`Movie with ID ${id} not found`); 
    }
    return movie;
  }

  postMovie(createMovieDto: CreateMovieDto){
    const movie: Movie = {
      id: this.idCounter++,
      ...createMovieDto,
    };
    this.movies.push(movie);
    return movie;
  }

  patchMovie(id: string, updateMovieDto: UpdateMovieDto){
    const movie = this.movies.find(movie => movie.id === +id);
    if(!movie){
      throw new NotFoundException(`Movie with ID ${id} not found`); 
    }
    // movie.title = updateMovieDto.title;
    // movie.year = updateMovieDto.year;
    Object.assign(movie, updateMovieDto);

    return movie;
  }

  deleteMovie(id: string){
    // const movie = this.movies.find(movie => movie.id === +id);
    // this.movies = this.movies.filter(movie => movie.id !== +id);
    const movieIndex = this.movies.findIndex(movie => movie.id === +id);
    if(movieIndex === -1){
      throw new NotFoundException(`Movie with ID ${id} not found`); 
    }
    this.movies.splice(movieIndex, 1);
    return id;
  }  
}
