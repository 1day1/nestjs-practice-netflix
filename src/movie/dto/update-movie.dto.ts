import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateMovieDto {
    @IsNotEmpty()
    @IsOptional()
    title?: string;
    
    @IsNotEmpty()
    @IsOptional()
    year?: number;
    
    @IsNotEmpty()
    @IsOptional()
    genre?: string;
}
