import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ConsultationListComponent } from './consultation-list/consultation-list.component';
import { ConsultationDetailComponent } from './consultation-detail/consultation-detail.component';
import { ConsultationFormComponent } from './consultation-form/consultation-form.component';
import { ConsultationService } from './consultation.service';
import { PatientService } from '../patients/patient.service';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

export class FrenchDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: object): string {
    if ((displayFormat as any) === 'input') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return date.toLocaleDateString('fr-FR', displayFormat as Intl.DateTimeFormatOptions);
  }

  override parse(value: any): Date | null {
    if (typeof value === 'string' && value.includes('/')) {
      const parts = value.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)
            && day >= 1 && day <= 31 && month >= 0 && month <= 11) {
          return new Date(year, month, day);
        }
      }
    }
    return super.parse(value);
  }
}

export const FRENCH_DATE_FORMATS = {
  parse: { dateInput: 'input' },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' } as Intl.DateTimeFormatOptions,
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' } as Intl.DateTimeFormatOptions,
    monthYearA11yLabel: { year: 'numeric', month: 'long' } as Intl.DateTimeFormatOptions,
  }
};

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
  providers: [
    ConsultationService,
    PatientService,
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: DateAdapter, useClass: FrenchDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: FRENCH_DATE_FORMATS }
  ]
})
export class ConsultationsModule {}
