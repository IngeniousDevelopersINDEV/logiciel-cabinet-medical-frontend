import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'confirm' | 'alert' | 'warning';
}

@Component({
  selector: 'app-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon *ngIf="data.type === 'warning'" color="warn">warning</mat-icon>
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button *ngIf="data.type !== 'alert'" (click)="onCancel()">
        {{ data.cancelText || 'Annuler' }}
      </button>
      <button mat-raised-button
              [color]="data.type === 'warning' ? 'warn' : 'primary'"
              (click)="onConfirm()">
        {{ data.confirmText || 'Confirmer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    mat-dialog-content p {
      font-size: 1rem;
      margin: 0;
    }
  `]
})
export class DialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
