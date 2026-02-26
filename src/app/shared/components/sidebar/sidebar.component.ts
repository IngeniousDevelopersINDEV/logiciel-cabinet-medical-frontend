import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/user.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  template: `
    <mat-sidenav
      [opened]="isOpen"
      [mode]="isMobile ? 'over' : 'side'"
      [class.collapsed]="isCollapsed && !isMobile"
      class="app-sidebar">

      <div class="sidebar-header">
        <mat-icon class="logo-icon">local_hospital</mat-icon>
        <span *ngIf="!isCollapsed" class="logo-text">Cabinet Médical</span>
      </div>

      <mat-nav-list class="nav-list">
        <ng-container *ngFor="let item of filteredNavItems">
          <a mat-list-item
             [routerLink]="item.route"
             routerLinkActive="active"
             [matTooltip]="isCollapsed ? item.label : ''"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle *ngIf="!isCollapsed">{{ item.label }}</span>
          </a>
        </ng-container>
      </mat-nav-list>

      <div class="sidebar-footer">
        <button mat-icon-button (click)="isCollapsed = !isCollapsed" class="collapse-btn">
          <mat-icon>{{ isCollapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>
    </mat-sidenav>
  `,
  styles: [`
    .app-sidebar {
      width: 250px;
      transition: width 0.3s ease;
      background: #1a237e;
      color: white;
      display: flex;
      flex-direction: column;

      &.collapsed {
        width: 64px;
      }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      min-height: 64px;

      .logo-icon { color: white; }
      .logo-text {
        font-size: 1rem;
        font-weight: 600;
        white-space: nowrap;
        color: white;
      }
    }

    .nav-list {
      flex: 1;
      padding: 8px 0;
    }

    a[mat-list-item] {
      color: rgba(255,255,255,0.7);
      border-radius: 8px;
      margin: 2px 8px;

      &.active {
        background: rgba(255,255,255,0.15);
        color: white;
      }

      &:hover {
        background: rgba(255,255,255,0.1);
        color: white;
      }

      mat-icon { color: inherit; }
    }

    .sidebar-footer {
      padding: 8px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      justify-content: flex-end;

      .collapse-btn { color: rgba(255,255,255,0.7); }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = true;

  isCollapsed = false;
  isMobile = false;
  currentUser: User | null = null;

  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard' },
    { label: 'Patients', icon: 'people', route: '/patients' },
    { label: 'Consultations', icon: 'medical_services', route: '/consultations' },
    { label: 'Prescriptions', icon: 'description', route: '/prescriptions' },
    { label: 'Rendez-vous', icon: 'calendar_today', route: '/appointments' },
    { label: 'Rapports', icon: 'bar_chart', route: '/reports' },
    { label: 'Utilisateurs', icon: 'manage_accounts', route: '/users', roles: ['ADMIN'] }
  ];

  get filteredNavItems(): NavItem[] {
    return this.navItems.filter(item => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.includes(this.currentUser?.role || '');
    });
  }

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth < 960;
    if (this.isMobile) {
      this.isCollapsed = false;
    }
  }
}
