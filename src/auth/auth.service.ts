import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/user/entitiy/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { envVariableKeys } from 'src/common/const/env.const';
import { isRef } from 'joi';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
        const basicSplit = rawToken.split(' ');

        if( basicSplit.length !== 2){
            throw new Error('Invalid Basic Authorization');
        }

        const [bearer, token] = basicSplit;

        if( bearer.toLocaleLowerCase() !== 'bearer'){
            throw new BadRequestException('Invalid token type');
        }

        try{
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>(
                    isRefreshToken ? 
                        envVariableKeys.refreshTokenSecret : 
                        envVariableKeys.accessTokenSecret
                ),
            })

            this.checkTokenType(payload, isRefreshToken);
    
            return payload;
    
        }catch(e){
            throw new UnauthorizedException('token expired');
        }

    }

    checkTokenType(payload: any, isRefreshToken: boolean) {
        if( isRefreshToken ){
            if( payload.type !== 'refresh'){
                throw new BadRequestException('Invalid token type : need refresh token');
            }
        }else{
            if( payload.type !== 'access'){
                throw new BadRequestException('Invalid token type : need access token');
            }
        }
    }

    parseBasicToken(rawToken: string) {
        const basicSplit = rawToken.split(' ');

        if(basicSplit[0] !== 'Basic' || basicSplit.length !== 2){
            throw new Error('Invalid Basic Authorization');
        }

        const [basic, token] = basicSplit;

        if( basic.toLocaleLowerCase() !== 'basic'){
            throw new BadRequestException('Invalid token type');
        }

        const decoded = Buffer.from(token, 'base64').toString('utf-8');

        const tokenSplit = decoded.split(':');

        if(tokenSplit.length !== 2){
            throw new Error('Invalid token format');
        }

        const [email, password] = tokenSplit;

        return { email, password };
    }

    // rawToken : Basic token
    async registerUser(rawToken: string) {

        const { email, password } = this.parseBasicToken(rawToken);

        const user = await this.userRepository.findOne({
            where: {
                email,
            },
        })

        if(user){
            throw new BadRequestException('User already exists');
        }

        const hash = await bcrypt.hash(password, this.configService.get<number>('HASH_ROUNDS'));
        
        await this.userRepository.save({
            email,
            password: hash,
        })

        return this.userRepository.findOne({
            where: {
                email,
            },
        })

    }

    async authenticate(email: string, password: string) {

        const user = await this.userRepository.findOne({
            where: {
                email,
            },
        })

        if(!user){
            throw new BadRequestException('User Not already exists');
        }

        const isValid = await bcrypt.compare(password, user.password);

        if(!isValid){
            throw new BadRequestException('Invalid password');
        }

        return user;
    }


    async issueToken(user: { id: number, role: Role }, isRefreshToken: boolean) {
        const refreshTokenSecret = this.configService.get<string>(envVariableKeys.refreshTokenSecret);
        const accessTokenSecret = this.configService.get<string>(envVariableKeys.accessTokenSecret);

        return this.jwtService.signAsync({
            sub: user.id,
            role: user.role,
            type: isRefreshToken ? 'refresh' : 'access',
        }, {
            secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
            expiresIn: isRefreshToken ? '24h' : 300,
        })
    }
        
    async loginUser(rawToken: string) {

        const { email, password } = this.parseBasicToken(rawToken);

        const user = await this.authenticate(email, password);


        return {
            refreshToken : await this.issueToken(user, true),
            accessToken : await this.issueToken(user, false),
        }

    }
  
  
}
