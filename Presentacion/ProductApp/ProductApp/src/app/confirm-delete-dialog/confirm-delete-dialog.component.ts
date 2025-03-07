  import {Component} from '@angular/core';
  import {FormsModule} from '@angular/forms';
  import {MatButtonModule} from '@angular/material/button';
  import {
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
  } from '@angular/material/dialog';
  import {MatFormFieldModule} from '@angular/material/form-field';
  import {MatInputModule} from '@angular/material/input';
  
  export interface DialogData {
    animal: string;
    name: string;
  }
  
  /**
   * @title Dialog Overview
   */
 
  @Component({
    selector: 'app-confirm-delete-dialog',
    template: `
    <h2 mat-dialog-title>Confirm Delete</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete this item?</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Delete</button>
    </mat-dialog-actions>
  `,
    standalone: true,
    imports: [
      MatFormFieldModule,
      MatInputModule,
      FormsModule,
      MatButtonModule,
      MatDialogTitle,
      MatDialogContent,
      MatDialogActions,
      MatDialogClose,
    ],
  })
  export class ConfirmDeleteDialogComponent {

    constructor(public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>) {}
  
    onCancel(): void {
      this.dialogRef.close(false); // Cancel, no deletion
    }
  
    onConfirm(): void {
      this.dialogRef.close(true);  // Confirm, perform deletion
    }
  }
