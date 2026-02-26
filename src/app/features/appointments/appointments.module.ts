import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { AppointmentService } from './appointment.service';
import { PatientService } from '../patients/patient.service';

const routes: Routes = [
  { path: '', component: AppointmentListComponent },
  { path: 'calendar', component: AppointmentCalendarComponent },
  { path: 'new', component: AppointmentFormComponent },
  { path: ':id/edit', component: AppointmentFormComponent }
];

@NgModule({
  declarations: [
    AppointmentListComponent,
    AppointmentCalendarComponent,
    AppointmentFormComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [AppointmentService, PatientService]
})
export class AppointmentsModule {}
