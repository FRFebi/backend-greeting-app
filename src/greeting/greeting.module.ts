import { Module } from '@nestjs/common';
import { GreetingController } from './greeting.controller';
import { GreetingService } from './greeting.service';
import { Trans_Data_EmailSchema } from './schemas/trans_data_email.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { UserSchema } from 'src/user/schemas/user.schema';
import { UserModule } from 'src/user/user.module';
import { BullModule } from '@nestjs/bull';
import { EmailConsumer } from './cron/greet.cron';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: 'Trans_Data_Email', schema: Trans_Data_EmailSchema },
      { name: 'User', schema: UserSchema },
    ]),
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'email',
    }),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [GreetingController],
  providers: [GreetingService, EmailConsumer],
})
export class GreetingModule {}
