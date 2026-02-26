import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  template: `
    <div [class.dark-theme]="isDarkTheme">
      <ng-container *ngIf="isAuthenticated">
        <mat-sidenav-container class="app-sidenav-container">
          <mat-sidenav
            #sidenav
            [opened]="sidenavOpen"
            [mode]="isMobile ? 'over' : 'side'"
            [style.width]="sidenavCollapsed && !isMobile ? '64px' : '250px'"
            class="app-sidebar-nav">

            <div class="sidebar-content">
              <div class="sidebar-brand">
                <mat-icon>local_hospital</mat-icon>
                <span *ngIf="!sidenavCollapsed || isMobile">Cabinet Médical</span>
              </div>

              <mat-nav-list class="nav-list">
                <a mat-list-item routerLink="/dashboard" routerLinkActive="active"
                   [matTooltip]="sidenavCollapsed && !isMobile ? 'Tableau de bord' : ''"
                   matTooltipPosition="right">
                  <mat-icon matListItemIcon>dashboard</mat-icon>
                  <span matListItemTitle *ngIf="!sidenavCollapsed || isMobile">Tableau de bord</span>
                </a>
                <a mat-list-item routerLink="/patients" routerLinkActive="active"
                   [matTooltip]="sidenavCollapsed && !isMobile ? 'Patients' : ''"
                   matTooltipPosition="right">
                  <mat-icon matListItemIcon>people</mat-icon>
                  <span matListItemTitle *ngIf="!sidenavCollapsed || isMobile">Patients</span>
                </a>
                <a mat-list-item routerLink="/consultations" routerLinkActive="active"
                   [matTooltip]="sidenavCollapsed && !isMobile ? 'Consultations' : ''"
                   matTooltipPosition="right">
                  <mat-icon matListItemIcon>medical_services</mat-icon>
                  <span matListItemTitle *ngIf="!sidenavCollapsed || isMobile">Consultations</span>
                </a>
                <a mat-list-item routerLink="/prescriptions" routerLinkActive="active"
                   [matTooltip]="sidenavCollapsed && !isMobile ? 'Prescriptions' : ''"
                   matTooltipPosition="right">
                  <mat-icon matListItemIcon>description</mat-icon>
                  <span matListItemTitle *ngIf="!sidenavCollapsed || isMobile">Prescriptions</span>
                </a>
                <a mat-list-item routerLink="/appointments" routerLinkActive="active"
                   [matTooltip]="sidenavCollapsed && !isMobile ? 'Rendez-vous' : ''"
                   matTooltipPosition="right">
                  <mat-icon matListItemIcon>calendar_today</mat-icon>
                  <span matListItemTitle *ngIf="!sidenavCollapsed || isMobile">Rendez-vous</span>
                </a>
                <a mat-list-item routerLink="/reports" routerLinkActive="active"
                   [matTooltip]="sidenavCollapsed && !isMobile ? 'Rapports' : ''"
                   matTooltipPosition="right">
                  <mat-icon matListItemIcon>bar_chart</mat-icon>
                  <span matListItemTitle *ngIf="!sidenavCollapsed || isMobile">Rapports</span>
                </a>
                <a mat-list-item routerLink="/users" routerLinkActive="active"
                   *ngIf="currentUser?.role === 'ADMIN'"
                   [matTooltip]="sidenavCollapsed && !isMobile ? 'Utilisateurs' : ''"
                   matTooltipPosition="right">
                  <mat-icon matListItemIcon>manage_accounts</mat-icon>
                  <span matListItemTitle *ngIf="!sidenavCollapsed || isMobile">Utilisateurs</span>
                </a>
              </mat-nav-list>

              <div class="sidebar-footer">
                <button mat-icon-button (click)="toggleCollapse()" *ngIf="!isMobile" class="collapse-btn">
                  <mat-icon>{{ sidenavCollapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
                </button>
              </div>
            </div>
          </mat-sidenav>

          <mat-sidenav-content class="app-content">
            <mat-toolbar color="primary" class="app-toolbar">
              <button mat-icon-button (click)="toggleSidenav()">
                <mat-icon>menu</mat-icon>
              </button>
              <span class="toolbar-brand">Cabinet Médical</span>
              <span class="spacer"></span>

              <button mat-icon-button (click)="toggleTheme()" matTooltip="Changer le thème">
                <mat-icon>{{ isDarkTheme ? 'light_mode' : 'dark_mode' }}</mat-icon>
              </button>

              <button mat-icon-button [matMenuTriggerFor]="userMenu">
                <mat-icon>account_circle</mat-icon>
              </button>

              <mat-menu #userMenu="matMenu">
                <div class="user-menu-info" mat-menu-item disabled>
                  <strong>{{ currentUser?.prenom }} {{ currentUser?.nom }}</strong>
                  <small>{{ currentUser?.role }}</small>
                </div>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="logout()">
                  <mat-icon>logout</mat-icon>
                  <span>Déconnexion</span>
                </button>
              </mat-menu>
            </mat-toolbar>

            <main class="main-content-area">
              <router-outlet></router-outlet>
            </main>

            <footer class="app-footer">
              <span>&copy; {{ year }} Cabinet Médical</span>
              <span>Version 1.0.0</span>
            </footer>
          </mat-sidenav-content>
        </mat-sidenav-container>
      </ng-container>

      <ng-container *ngIf="!isAuthenticated">
        <router-outlet></router-outlet>
      </ng-container>
    </div>
  `,
  styles: [`
    .app-sidenav-container {
      height: 100vh;
    }

    .app-sidebar-nav {
      background: #1a237e;
      color: white;
      transition: width 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .sidebar-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      height: 64px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      font-size: 1rem;
      font-weight: 600;
      color: white;
      overflow: hidden;
      white-space: nowrap;
      mat-icon { color: white; font-size: 28px; min-width: 28px; }
    }

    .nav-list {
      flex: 1;
      padding: 8px;
    }

    a[mat-list-item] {
      color: rgba(255,255,255,0.7) !important;
      border-radius: 8px;
      margin-bottom: 2px;

      &.active {
        background: rgba(255,255,255,0.15) !important;
        color: white !important;
      }

      &:hover {
        background: rgba(255,255,255,0.1) !important;
        color: white !important;
      }

      mat-icon { color: inherit !important; }
    }

    .sidebar-footer {
      padding: 8px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      justify-content: flex-end;
      .collapse-btn { color: rgba(255,255,255,0.7); }
    }

    .app-content {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-brand {
      font-weight: 600;
      font-size: 1.1rem;
      margin-left: 8px;
    }

    .spacer { flex: 1; }

    .main-content-area {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .app-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 24px;
      background: #f5f5f5;
      border-top: 1px solid #e0e0e0;
      font-size: 0.75rem;
      color: #757575;
    }

    .user-menu-info {
      display: flex;
      flex-direction: column;
      padding: 8px 16px;
      pointer-events: none;
      small { color: #757575; }
    }
  `]
})
export class AppComponent implements OnInit {
  isDarkTheme = false;
  sidenavOpen = true;
  sidenavCollapsed = false;
  isMobile = false;
  isAuthenticated = false;
  currentUser: User | null = null;
  year = new Date().getFullYear();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUser = user;
    });
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth < 960;
    if (this.isMobile) {
      this.sidenavOpen = false;
    } else {
      this.sidenavOpen = true;
    }
  }

  toggleSidenav(): void {
    if (this.isMobile) {
      this.sidenavOpen = !this.sidenavOpen;
    } else {
      this.sidenavCollapsed = !this.sidenavCollapsed;
    }
  }

  toggleCollapse(): void {
    this.sidenavCollapsed = !this.sidenavCollapsed;
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
  }

  logout(): void {
    this.authService.logout();
  }
}
