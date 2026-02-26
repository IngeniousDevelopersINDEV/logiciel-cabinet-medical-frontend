import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-header',
  template: `
    <mat-toolbar color="primary" class="app-header">
      <button mat-icon-button (click)="toggleSidebar.emit()">
        <mat-icon>menu</mat-icon>
      </button>

      <a routerLink="/dashboard" class="brand">
        <mat-icon>local_hospital</mat-icon>
        <span class="brand-name hide-mobile">Cabinet Médical</span>
      </a>

      <span class="spacer"></span>

      <button mat-icon-button (click)="toggleTheme()" matTooltip="Changer le thème">
        <mat-icon>{{ isDarkTheme ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      <button mat-icon-button [matMenuTriggerFor]="userMenu" *ngIf="currentUser">
        <mat-icon>account_circle</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu">
        <div class="user-menu-header" mat-menu-item disabled>
          <strong>{{ currentUser?.prenom }} {{ currentUser?.nom }}</strong>
          <br>
          <small>{{ currentUser?.role }}</small>
        </div>
        <mat-divider></mat-divider>
        <button mat-menu-item routerLink="/users/profile">
          <mat-icon>person</mat-icon>
          <span>Mon profil</span>
        </button>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Déconnexion</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 100;
      height: 64px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      text-decoration: none;
      margin-left: 8px;
    }
    .brand-name {
      font-size: 1.1rem;
      font-weight: 600;
    }
    .spacer { flex: 1; }
    .user-menu-header {
      padding: 8px 16px;
      line-height: 1.4;
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() isDarkTheme = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() themeChange = new EventEmitter<boolean>();

  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeChange.emit(this.isDarkTheme);
  }

  logout(): void {
    this.authService.logout();
  }
}
