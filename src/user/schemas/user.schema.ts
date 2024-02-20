import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop()
  firstname: string;

  @Prop()
  lastname: string;

  @Prop({ type: Date })
  dob: string;

  @Prop()
  timezone: number;

  @Prop()
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
