import { IsNotEmpty } from "class-validator";

export class CreateMovieDto {
    @IsNotEmpty()
    title: string;
    
    @IsNotEmpty()
    year: number;
    
    @IsNotEmpty()
    genre: string;
}
