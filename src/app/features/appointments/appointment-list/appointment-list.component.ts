import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { AppointmentService } from '../appointment.service';
import { RendezVous } from '../../../models/appointment.model';
import { NotificationService } from '../../../core/services/notification.service';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-appointment-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Rendez-vous</h1>
        <div class="header-actions">
          <button mat-stroked-button routerLink="/appointments/calendar">
            <mat-icon>calendar_view_month</mat-icon>
            Calendrier
          </button>
          <button mat-raised-button color="primary" routerLink="/appointments/new">
            <mat-icon>event</mat-icon>
            Nouveau Rendez-vous
          </button>
        </div>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select [(ngModel)]="selectedStatut" (ngModelChange)="loadAppointments()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="PLANIFIE">Planifié</mat-option>
                <mat-option value="CONFIRME">Confirmé</mat-option>
                <mat-option value="ANNULE">Annulé</mat-option>
                <mat-option value="TERMINE">Terminé</mat-option>
                <mat-option value="ABSENT">Absent</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="table-container" *ngIf="!isLoading; else loading">
            <table mat-table [dataSource]="appointments">
              <ng-container matColumnDef="patient">
                <th mat-header-cell *matHeaderCellDef>Patient</th>
                <td mat-cell *matCellDef="let r">{{ r.patientNom }}</td>
              </ng-container>
              <ng-container matColumnDef="medecin">
                <th mat-header-cell *matHeaderCellDef>Médecin</th>
                <td mat-cell *matCellDef="let r">{{ r.medecinNom }}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date & Heure</th>
                <td mat-cell *matCellDef="let r">{{ r.dateHeure | date:'dd/MM/yyyy HH:mm' }}</td>
              </ng-container>
              <ng-container matColumnDef="duree">
                <th mat-header-cell *matHeaderCellDef>Durée</th>
                <td mat-cell *matCellDef="let r">{{ r.duree }} min</td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let r">{{ getTypeLabel(r.type) }}</td>
              </ng-container>
              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let r">
                  <span class="badge" [class]="getStatutClass(r.statut)">{{ getStatutLabel(r.statut) }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let r">
                  <button mat-icon-button color="primary" [routerLink]="['/appointments', r.id]" matTooltip="Voir">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" [routerLink]="['/appointments', r.id, 'edit']" matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteAppointment(r)" matTooltip="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"
                  [routerLink]="['/appointments', row.id]"></tr>
            </table>
            <div class="empty-state" *ngIf="appointments.length === 0">
              <mat-icon>calendar_today</mat-icon>
              <p>Aucun rendez-vous trouvé</p>
            </div>
          </div>

          <ng-template #loading>
            <div class="loading-state"><mat-spinner diameter="40"></mat-spinner></div>
          </ng-template>

          <mat-paginator [length]="totalElements" [pageSize]="pageSize"
                         [pageSizeOptions]="[10, 25, 50]" (page)="onPageChange($event)" showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header-actions { display: flex; gap: 8px; }
    .header-actions button { display: flex; align-items: center; gap: 8px; }
    .filters-row { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .table-row:hover { background: #f5f5f5; cursor: pointer; }
    .loading-state { display: flex; justify-content: center; padding: 32px; }
  `]
})
export class AppointmentListComponent implements OnInit {
  appointments: RendezVous[] = [];
  isLoading = false;
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  selectedStatut = '';

  displayedColumns = ['patient', 'medecin', 'date', 'duree', 'type', 'statut', 'actions'];

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit(): void { this.loadAppointments(); }

  loadAppointments(): void {
    this.isLoading = true;
    this.appointmentService.getAll({ page: this.currentPage, size: this.pageSize }).subscribe({
      next: (r) => { this.appointments = r.content || []; this.totalElements = r.totalElements || 0; this.isLoading = false; },
      error: () => { this.appointments = []; this.isLoading = false; }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAppointments();
  }

  getStatutLabel(s: string): string {
    return { PLANIFIE: 'Planifié', CONFIRME: 'Confirmé', ANNULE: 'Annulé', TERMINE: 'Terminé', ABSENT: 'Absent' }[s] || s;
  }

  getStatutClass(s: string): string {
    return { PLANIFIE: 'badge-warning', CONFIRME: 'badge-info', ANNULE: 'badge-danger', TERMINE: 'badge-success', ABSENT: 'badge-secondary' }[s] || 'badge-secondary';
  }

  getTypeLabel(t: string): string {
    return { CONSULTATION: 'Consultation', SUIVI: 'Suivi', URGENCE: 'Urgence', BILAN: 'Bilan', AUTRE: 'Autre' }[t] || t;
  }

  deleteAppointment(r: RendezVous): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title: 'Supprimer le rendez-vous', message: 'Confirmer la suppression ?', type: 'warning', confirmText: 'Supprimer' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appointmentService.delete(r.id).subscribe({
          next: () => { this.notification.success('Rendez-vous supprimé'); this.loadAppointments(); },
          error: (err) => this.notification.error(err.message)
        });
      }
    });
  }
}
