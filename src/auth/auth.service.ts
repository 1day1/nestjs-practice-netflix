import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/user/entitiy/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    parseBasicToken(rawToken: string) {
        const basicSplit = rawToken.split(' ');

        if(basicSplit[0] !== 'Basic' || basicSplit.length !== 2){
            throw new Error('Invalid Basic Authorization');
        }

        const [basic, token] = basicSplit;
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
        const refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
        const accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');

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
