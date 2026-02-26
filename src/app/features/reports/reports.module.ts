import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MedicalReportComponent } from './medical-report/medical-report.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ReportService } from './report.service';
import { PatientService } from '../patients/patient.service';

const routes: Routes = [
  { path: '', component: StatisticsComponent },
  { path: 'medical', component: MedicalReportComponent },
  { path: 'statistics', component: StatisticsComponent }
];

@NgModule({
  declarations: [
    MedicalReportComponent,
    StatisticsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [ReportService, PatientService]
})
export class ReportsModule {}
