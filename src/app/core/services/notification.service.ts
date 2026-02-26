import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Service de notifications - affiche des messages toast à l'utilisateur
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly duration = 4000;

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Notification de succès
   */
  success(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: this.duration,
      panelClass: ['snack-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Notification d'erreur
   */
  error(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: this.duration * 1.5,
      panelClass: ['snack-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Notification d'avertissement
   */
  warning(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: this.duration,
      panelClass: ['snack-warning'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Notification d'information
   */
  info(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: this.duration,
      panelClass: ['snack-info'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
