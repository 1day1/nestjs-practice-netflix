import { Exclude, Expose } from "class-transformer";
import { BaseTable } from "src/common/entity/base-table.entity";
import { Director } from "src/director/entitiy/director.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MovieDetail } from "./movie-detail.entity";
import Joi from "joi";
import { Genre } from "src/genre/entitiy/genre.entity";

@Entity()
export class Movie extends BaseTable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
    })
    title: string;

    // @Column()
    // genre: string;

    @ManyToMany(
        ()=> Genre,
        genre => genre.movies,
    )
    @JoinTable()
    genres: Genre[];

    @OneToOne(() => MovieDetail, movieDetail => movieDetail.id,{
        cascade: true,
        nullable: false,
    })
    @JoinColumn()
    detail: MovieDetail;

    @ManyToOne(() => Director, director => director.id,{
        cascade: true,
        nullable: false,
    })
    director: Director;
}
  