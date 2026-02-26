import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'patients',
        loadChildren: () => import('./features/patients/patients.module').then(m => m.PatientsModule)
      },
      {
        path: 'consultations',
        loadChildren: () => import('./features/consultations/consultations.module').then(m => m.ConsultationsModule)
      },
      {
        path: 'prescriptions',
        loadChildren: () => import('./features/prescriptions/prescriptions.module').then(m => m.PrescriptionsModule)
      },
      {
        path: 'appointments',
        loadChildren: () => import('./features/appointments/appointments.module').then(m => m.AppointmentsModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
