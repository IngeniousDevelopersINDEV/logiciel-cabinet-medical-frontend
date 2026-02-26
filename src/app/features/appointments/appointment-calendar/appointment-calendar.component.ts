import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../appointment.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-appointment-calendar',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Calendrier des Rendez-vous</h1>
        <button mat-raised-button color="primary" routerLink="/appointments/new">
          <mat-icon>event</mat-icon>
          Nouveau Rendez-vous
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="calendar-toolbar">
            <button mat-icon-button (click)="previousMonth()">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <h2>{{ currentDate | date:'MMMM yyyy' }}</h2>
            <button mat-icon-button (click)="nextMonth()">
              <mat-icon>chevron_right</mat-icon>
            </button>
            <button mat-stroked-button (click)="today()" class="today-btn">Aujourd'hui</button>
          </div>

          <div class="calendar-grid">
            <div class="day-header" *ngFor="let day of dayNames">{{ day }}</div>
            <div class="calendar-day"
                 *ngFor="let day of calendarDays"
                 [class.other-month]="!day.currentMonth"
                 [class.today]="day.isToday"
                 [class.has-events]="day.appointments.length > 0">
              <span class="day-number">{{ day.date | date:'d' }}</span>
              <div class="day-events">
                <div class="event-chip"
                     *ngFor="let rdv of day.appointments.slice(0, 3)"
                     [class]="'event-' + rdv.statut?.toLowerCase()"
                     [matTooltip]="rdv.patientNom + ' - ' + rdv.motif"
                     [routerLink]="['/appointments', rdv.id]">
                  <mat-icon class="event-icon">person</mat-icon>
                  <span>{{ rdv.dateHeure | date:'HH:mm' }} {{ rdv.patientNom }}</span>
                </div>
                <div *ngIf="day.appointments.length > 3" class="more-events">
                  +{{ day.appointments.length - 3 }} de plus
                </div>
              </div>
            </div>
          </div>

          <div class="calendar-legend">
            <div class="legend-item"><span class="legend-color planifie"></span>Planifié</div>
            <div class="legend-item"><span class="legend-color confirme"></span>Confirmé</div>
            <div class="legend-item"><span class="legend-color termine"></span>Terminé</div>
            <div class="legend-item"><span class="legend-color annule"></span>Annulé</div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; button { display: flex; align-items: center; gap: 8px; } }

    .calendar-toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      h2 { font-size: 1.25rem; font-weight: 600; min-width: 200px; text-align: center; }
      .today-btn { margin-left: 8px; }
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #e0e0e0;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .day-header {
      background: #f5f5f5;
      padding: 8px;
      text-align: center;
      font-weight: 600;
      font-size: 0.875rem;
      color: #757575;
    }

    .calendar-day {
      background: white;
      min-height: 100px;
      padding: 8px;
      &.other-month { background: #fafafa; .day-number { color: #bdbdbd; } }
      &.today .day-number {
        background: #1976d2;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }
    }

    .day-number {
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 4px;
      display: block;
    }

    .event-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      cursor: pointer;
      margin-bottom: 2px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      .event-icon { font-size: 12px; width: 12px; height: 12px; }

      &.event-planifie { background: rgba(255, 152, 0, 0.2); color: #e65100; }
      &.event-confirme { background: rgba(33, 150, 243, 0.2); color: #1565c0; }
      &.event-termine { background: rgba(76, 175, 80, 0.2); color: #2e7d32; }
      &.event-annule { background: rgba(244, 67, 54, 0.2); color: #c62828; }
    }

    .more-events { font-size: 0.7rem; color: #757575; padding: 2px 6px; }

    .calendar-legend {
      display: flex;
      gap: 24px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      &.planifie { background: rgba(255, 152, 0, 0.5); }
      &.confirme { background: rgba(33, 150, 243, 0.5); }
      &.termine { background: rgba(76, 175, 80, 0.5); }
      &.annule { background: rgba(244, 67, 54, 0.5); }
    }
  `]
})
export class AppointmentCalendarComponent implements OnInit {
  currentDate = new Date();
  calendarDays: any[] = [];
  dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  appointments: any[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.generateCalendar();
    this.loadMonthAppointments();
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    this.calendarDays = [];
    const today = new Date();

    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      this.calendarDays.push({ date: d, currentMonth: false, isToday: false, appointments: [] });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const isToday = date.toDateString() === today.toDateString();
      this.calendarDays.push({ date, currentMonth: true, isToday, appointments: [] });
    }

    const remaining = 42 - this.calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      this.calendarDays.push({ date: new Date(year, month + 1, i), currentMonth: false, isToday: false, appointments: [] });
    }
  }

  loadMonthAppointments(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const debut = new Date(year, month, 1).toISOString().split('T')[0];
    const fin = new Date(year, month + 1, 0).toISOString().split('T')[0];

    this.appointmentService.getByDateRange(debut, fin).subscribe({
      next: (data) => {
        this.appointments = data;
        this.distributeAppointments();
      },
      error: () => {}
    });
  }

  distributeAppointments(): void {
    this.calendarDays.forEach(day => {
      day.appointments = this.appointments.filter(rdv => {
        const rdvDate = new Date(rdv.dateHeure).toDateString();
        return rdvDate === day.date.toDateString();
      });
    });
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
    this.loadMonthAppointments();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
    this.loadMonthAppointments();
  }

  today(): void {
    this.currentDate = new Date();
    this.generateCalendar();
    this.loadMonthAppointments();
  }
}
