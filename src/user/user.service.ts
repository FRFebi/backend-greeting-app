import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async deleteUser(id: string): Promise<User> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
    }
    return await this.userModel.findByIdAndDelete(id);
  }

  async createUser(user: CreateUserDto): Promise<User> {
    return await this.userModel.create(user);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find();
  }
}
