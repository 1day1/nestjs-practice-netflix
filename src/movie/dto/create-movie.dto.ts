import { Optional } from "@nestjs/common";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateMovieDto {
    @IsNotEmpty()
    @IsString()
    title: string;
    
    @IsNotEmpty()
    @IsString()
    detail: string;

    // @IsNotEmpty()
    // @IsString()
    // genre: string;

    @IsNotEmpty()
    @IsNumber()
    directorId: number;
    
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    genreIds: number[];
}
