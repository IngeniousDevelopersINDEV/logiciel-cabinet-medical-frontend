import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ConsultationListComponent } from './consultation-list/consultation-list.component';
import { ConsultationDetailComponent } from './consultation-detail/consultation-detail.component';
import { ConsultationFormComponent } from './consultation-form/consultation-form.component';
import { ConsultationService } from './consultation.service';
import { PatientService } from '../patients/patient.service';

const routes: Routes = [
  { path: '', component: ConsultationListComponent },
  { path: 'new', component: ConsultationFormComponent },
  { path: ':id', component: ConsultationDetailComponent },
  { path: ':id/edit', component: ConsultationFormComponent }
];

@NgModule({
  declarations: [
    ConsultationListComponent,
    ConsultationDetailComponent,
    ConsultationFormComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [ConsultationService, PatientService]
})
export class ConsultationsModule {}
