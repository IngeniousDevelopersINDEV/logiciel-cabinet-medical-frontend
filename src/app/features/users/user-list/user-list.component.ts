import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { UserService } from '../user.service';
import { User } from '../../../models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Utilisateurs</h1>
        <button mat-raised-button color="primary" routerLink="/users/new">
          <mat-icon>person_add</mat-icon>
          Nouvel Utilisateur
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="table-container" *ngIf="!isLoading; else loading">
            <table mat-table [dataSource]="users">
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom complet</th>
                <td mat-cell *matCellDef="let u">{{ u.prenom }} {{ u.nom }}</td>
              </ng-container>
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let u">{{ u.email }}</td>
              </ng-container>
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Rôle</th>
                <td mat-cell *matCellDef="let u">
                  <span class="badge" [class]="getRoleClass(u.role)">{{ getRoleLabel(u.role) }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="telephone">
                <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                <td mat-cell *matCellDef="let u">{{ u.telephone || '-' }}</td>
              </ng-container>
              <ng-container matColumnDef="actif">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let u">
                  <span class="badge" [class]="u.actif ? 'badge-success' : 'badge-danger'">
                    {{ u.actif ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let u">
                  <button mat-icon-button color="accent" [routerLink]="['/users', u.id, 'edit']" matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteUser(u)" matTooltip="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
            </table>
            <div class="empty-state" *ngIf="users.length === 0">
              <mat-icon>manage_accounts</mat-icon>
              <p>Aucun utilisateur trouvé</p>
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
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; button { display: flex; align-items: center; gap: 8px; } }
    .table-row:hover { background: #f5f5f5; }
    .loading-state { display: flex; justify-content: center; padding: 32px; }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  displayedColumns = ['nom', 'email', 'role', 'telephone', 'actif', 'actions'];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAll({ page: this.currentPage, size: this.pageSize }).subscribe({
      next: (r) => { this.users = r.content || []; this.totalElements = r.totalElements || 0; this.isLoading = false; },
      error: () => { this.users = []; this.isLoading = false; }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  getRoleLabel(role: string): string {
    return { ADMIN: 'Admin', MEDECIN: 'Médecin', SECRETAIRE: 'Secrétaire', PATIENT: 'Patient' }[role] || role;
  }

  getRoleClass(role: string): string {
    return { ADMIN: 'badge-danger', MEDECIN: 'badge-info', SECRETAIRE: 'badge-warning', PATIENT: 'badge-success' }[role] || 'badge-secondary';
  }

  deleteUser(u: User): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title: 'Supprimer l\'utilisateur', message: `Supprimer ${u.prenom} ${u.nom} ?`, type: 'warning', confirmText: 'Supprimer' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.delete(u.id).subscribe({
          next: () => { this.notification.success('Utilisateur supprimé'); this.loadUsers(); },
          error: (err) => this.notification.error(err.message)
        });
      }
    });
  }
}
