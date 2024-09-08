import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  getMovies(@Query('title') title?: string) {
    return this.movieService.getManyMovies(title);
  }

  @Get(':id')
  getMovie(@Param('id') id: string){
    return this.movieService.getOneMovie(id);
  }

  @Post()
  postMovie(@Body() createMovieDto: CreateMovieDto){
    return this.movieService.postMovie(createMovieDto);
  }

  @Patch(':id') 
  patchMovie(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto){
    return this.movieService.updateMovie(id, updateMovieDto);
  }

  @Delete(':id')
  deleteMovie(@Param('id') id: string){
    return this.movieService.deleteMovie(id);
  }  
}
