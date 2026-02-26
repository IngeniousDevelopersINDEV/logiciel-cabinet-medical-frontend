import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PrescriptionListComponent } from './prescription-list/prescription-list.component';
import { PrescriptionDetailComponent } from './prescription-detail/prescription-detail.component';
import { PrescriptionFormComponent } from './prescription-form/prescription-form.component';
import { PrescriptionService } from './prescription.service';
import { PatientService } from '../patients/patient.service';

const routes: Routes = [
  { path: '', component: PrescriptionListComponent },
  { path: 'new', component: PrescriptionFormComponent },
  { path: ':id', component: PrescriptionDetailComponent },
  { path: ':id/edit', component: PrescriptionFormComponent }
];

@NgModule({
  declarations: [
    PrescriptionListComponent,
    PrescriptionDetailComponent,
    PrescriptionFormComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [PrescriptionService, PatientService]
})
export class PrescriptionsModule {}
