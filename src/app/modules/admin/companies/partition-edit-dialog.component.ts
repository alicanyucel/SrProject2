import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-partition-edit-dialog',
  templateUrl: './partition-edit-dialog.component.html',
  styleUrls: ['./partition-edit-dialog.component.scss']
})
export class PartitionEditDialogComponent {
  partitionForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<PartitionEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.partitionForm = this.fb.group({
      partitionName: [data.partitionName, Validators.required],
      modality: [data.modality, Validators.required]
    });
  }

  onSave(): void {
    if (this.partitionForm.valid) {
      this.dialogRef.close({
        ...this.data,
        ...this.partitionForm.value
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
