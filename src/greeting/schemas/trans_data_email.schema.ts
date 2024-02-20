import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Trans_Data_Email {
  @Prop()
  email: string;

  @Prop()
  message: string;

  @Prop()
  status: string;

  @Prop({ type: Date })
  target_time: string;
}

export const Trans_Data_EmailSchema =
  SchemaFactory.createForClass(Trans_Data_Email);
