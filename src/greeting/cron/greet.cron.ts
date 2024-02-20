import { HttpService } from '@nestjs/axios';
import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosRequestConfig } from 'axios';
// import { Cron } from '@nestjs/schedule';
import { Job } from 'bull';
import { lastValueFrom, map } from 'rxjs';
import { Trans_Data_Email } from '../schemas/trans_data_email.schema';
import { Model } from 'mongoose';

@Processor('email')
@Injectable()
export class EmailConsumer {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Trans_Data_Email.name)
    private TDEModel: Model<Trans_Data_Email>,
  ) {}
  private readonly logger = new Logger(EmailConsumer.name);

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @Process()
  async handleSendingGreetEmail(
    job: Job<{ id: string; email: string; message: string }>,
  ) {
    this.logger.debug(job.data);

    const requestConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const url = process.env.DEV_SEND_EMAIL_URI;
    const body = {
      email: job.data.email,
      message: job.data.message,
    };

    const responseData = await lastValueFrom(
      this.httpService.post(url, body, requestConfig).pipe(
        map((response) => {
          return response.data;
        }),
      ),
    );

    const status = responseData.status;
    if (status === 'sent') {
      await this.TDEModel.updateOne(
        { _id: job.data.id },
        { $set: { status: responseData.status } },
      );
    }
    {
      this.logger.error(job.data.email);
    }
    this.logger.debug(await responseData);
    return {};
  }
}
