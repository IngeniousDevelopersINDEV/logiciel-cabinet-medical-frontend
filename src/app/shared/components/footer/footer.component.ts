import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="app-footer">
      <span>&copy; {{ currentYear }} Cabinet Médical - Tous droits réservés</span>
      <span>Version 1.0.0</span>
    </footer>
  `,
  styles: [`
    .app-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 24px;
      background: #f5f5f5;
      border-top: 1px solid #e0e0e0;
      font-size: 0.75rem;
      color: #757575;
      height: 48px;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
