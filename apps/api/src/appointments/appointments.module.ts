import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentsScheduler } from './appointments.scheduler';
import { WaitlistModule } from '../waitlist/waitlist.module';

@Module({
  imports: [WaitlistModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsScheduler],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}

