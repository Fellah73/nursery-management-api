import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! mohamed how are you? I am fine thank you';
  }

}
