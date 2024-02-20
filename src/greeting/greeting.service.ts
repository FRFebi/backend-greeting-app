import { Injectable, Logger } from '@nestjs/common';
import { GreetingRequestDto } from './dto/greeting_request.dto';
import { Trans_Data_Email } from './schemas/trans_data_email.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { User } from 'src/user/schemas/user.schema';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class GreetingService {
  constructor(
    @InjectModel(Trans_Data_Email.name)
    private TDEModel: Model<Trans_Data_Email>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  private readonly logger = new Logger(GreetingService.name);

  async sendEmail(
    request: GreetingRequestDto,
  ): Promise<{ status: string; sentTime: string }> {
    let status = 'sent';
    const random = this.getRandomInt(10);
    if (random == 1) {
      status = 'error';
    }

    const trans = {
      email: request.email,
      message: request.message,
      status: status,
      createdAt: new Date().toISOString(),
    };
    // const res = await this.TDEModel.create(trans);

    return { status: trans.status, sentTime: trans.createdAt };
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  //Cron Data Daily For Tommorow Birthday
  @Cron('0 */5 * * * *') //Dev
  // @Cron('0 0 17 * * *') //Prod
  async getWhoBirthdayTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const data = await this.userModel
      .find({
        $expr: {
          $and: [
            {
              $eq: [
                { $dayOfMonth: '$dob' },
                {
                  $dayOfMonth: tomorrow,
                },
              ],
            },
            {
              $eq: [{ $month: '$dob' }, { $month: tomorrow }],
            },
          ],
        },
      })
      .exec();

    if (data.length > 0) {
      for (const user of data) {
        const date = new Date();
        const userTz = user.timezone;
        const tzdiff = 9 - userTz;
        const hoursToMs = date.getTime() + tzdiff * 60 * 60 * 1000;
        date.setTime(hoursToMs);
        const targetTime = date.toISOString();

        const trans = {
          email: user.email,
          message: `Hey, ${user.firstname} ${user.lastname} it’s your birthday`,
          status: 'waiting',
          target_time: targetTime,
        };
        await this.TDEModel.create(trans);
        this.logger.debug(trans);
      }
    }
    this.logger.debug(data);
  }

  @Cron('*/30 * * * * *') //Dev
  // @Cron('0 */30 * * * *') //Prod
  async handleEmailScheduler() {
    const data = await this.TDEModel.find({
      $expr: {
        $and: [
          {
            status: { $not: 'sent' },
          },
          {
            target_time: {
              $gte: ['$target_time', new Date()],
            },
          },
          {
            target_time: {
              $lt: ['$target_time', new Date()],
            },
          },
        ],
      },
    }).exec();

    if (data.length > 0) {
      for (const tde of data) {
        await this.emailQueue.add({
          id: tde.id,
          email: tde.email,
          message: tde.message,
        });
      }
    }

    this.logger.debug(data);
  }
}
