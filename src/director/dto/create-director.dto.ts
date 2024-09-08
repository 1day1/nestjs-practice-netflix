import { IsDate, IsDateString, IsNotEmpty, IsString, isString } from "class-validator";

export class CreateDirectorDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsDateString()
    dob: Date;

    @IsNotEmpty()
    @IsString()
    nationality: string;
}
