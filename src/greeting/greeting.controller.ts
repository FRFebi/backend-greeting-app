import { Body, Controller, Post } from '@nestjs/common';
import { GreetingRequestDto } from './dto/greeting_request.dto';
import { GreetingService } from './greeting.service';

@Controller('greeting')
export class GreetingController {
  constructor(private greetingService: GreetingService) {}

  @Post('/send-email')
  async sendEmail(
    @Body() request: GreetingRequestDto,
  ): Promise<{ status: string; sentTime: string }> {
    return this.greetingService.sendEmail(request);
  }
}
