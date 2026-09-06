import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    // On ne renvoie pas le hash du mot de passe
    const { password_hash, ...result } = user;
    return {
      message: 'Inscription réussie',
      user: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.login(loginUserDto);
    // TODO: Générer un JWT plus tard, pour le moment on renvoie l'utilisateur
    const { password_hash, ...result } = user;
    return {
      message: 'Connexion réussie',
      user: result,
      token: 'fake-jwt-token-for-mvp',
    };
  }
}
