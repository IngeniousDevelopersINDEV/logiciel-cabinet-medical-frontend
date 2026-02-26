import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PatientService } from '../patient.service';
import { Patient } from '../../../models/patient.model';
import { NotificationService } from '../../../core/services/notification.service';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-patient-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Patients</h1>
        <button mat-raised-button color="primary" routerLink="/patients/new">
          <mat-icon>person_add</mat-icon>
          Nouveau Patient
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <!-- Filters -->
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher</mat-label>
              <input matInput (input)="onSearch($event)" placeholder="Nom, prénom, email...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <!-- Table -->
          <div class="table-container" *ngIf="!isLoading; else loading">
            <table mat-table [dataSource]="patients" matSort (matSortChange)="onSort($event)">

              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
                <td mat-cell *matCellDef="let p">
                  <div class="patient-name">
                    <mat-icon>person</mat-icon>
                    {{ p.prenom }} {{ p.nom }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="dateNaissance">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date de naissance</th>
                <td mat-cell *matCellDef="let p">{{ p.dateNaissance | date:'dd/MM/yyyy' }}</td>
              </ng-container>

              <ng-container matColumnDef="sexe">
                <th mat-header-cell *matHeaderCellDef>Sexe</th>
                <td mat-cell *matCellDef="let p">{{ p.sexe === 'M' ? 'Masculin' : p.sexe === 'F' ? 'Féminin' : 'Autre' }}</td>
              </ng-container>

              <ng-container matColumnDef="telephone">
                <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                <td mat-cell *matCellDef="let p">{{ p.telephone || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let p">{{ p.email || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="actif">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let p">
                  <span class="badge" [class]="p.actif ? 'badge-success' : 'badge-danger'">
                    {{ p.actif ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let p">
                  <button mat-icon-button color="primary"
                          [routerLink]="['/patients', p.id]"
                          matTooltip="Voir détail">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent"
                          [routerLink]="['/patients', p.id, 'edit']"
                          matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn"
                          (click)="deletePatient(p)"
                          matTooltip="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
            </table>

            <div class="empty-state" *ngIf="patients.length === 0">
              <mat-icon>people_outline</mat-icon>
              <p>Aucun patient trouvé</p>
              <button mat-raised-button color="primary" routerLink="/patients/new">
                Ajouter un patient
              </button>
            </div>
          </div>

          <ng-template #loading>
            <div class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          </ng-template>

          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 0; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      button { display: flex; align-items: center; gap: 8px; }
    }

    .filters-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .search-field { min-width: 300px; }

    .patient-name {
      display: flex;
      align-items: center;
      gap: 8px;
      mat-icon { color: #9e9e9e; font-size: 18px; }
    }

    .table-row:hover { background: #f5f5f5; cursor: pointer; }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 32px;
    }
  `]
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  isLoading = false;
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  searchQuery = '';
  sortBy = 'nom';
  sortDir: 'asc' | 'desc' = 'asc';

  displayedColumns = ['nom', 'dateNaissance', 'sexe', 'telephone', 'email', 'actif', 'actions'];

  private searchSubject = new Subject<string>();

  constructor(
    private patientService: PatientService,
    private dialog: MatDialog,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.currentPage = 0;
      this.loadPatients();
    });
  }

  loadPatients(): void {
    this.isLoading = true;
    this.patientService.getAll({
      search: this.searchQuery,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDir: this.sortDir
    }).subscribe({
      next: (response) => {
        this.patients = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.isLoading = false;
      },
      error: () => {
        this.patients = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPatients();
  }

  onSort(event: any): void {
    this.sortBy = event.active;
    this.sortDir = event.direction || 'asc';
    this.loadPatients();
  }

  deletePatient(patient: Patient): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer le patient ${patient.prenom} ${patient.nom} ?`,
        type: 'warning',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.delete(patient.id).subscribe({
          next: () => {
            this.notification.success('Patient supprimé avec succès');
            this.loadPatients();
          },
          error: (err) => this.notification.error(err.message)
        });
      }
    });
  }
}
