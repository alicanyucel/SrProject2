import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hospital-partition-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './hospital-partition-edit-dialog.component.html',
  styleUrls: ['./hospital-partition-edit-dialog.component.scss']
})
export class HospitalPartitionEditDialogComponent {
  editForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<HospitalPartitionEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      partitionId: [{ value: data.id || data.partitionId, disabled: true }, Validators.required],
      companyId: [{ value: data.companyId, disabled: true }, Validators.required],
      hospitalId: [{ value: data.hospitalId, disabled: true }, Validators.required],
      partitionName: [data.partitionName, Validators.required],
      isActive: [data.isActive !== undefined ? data.isActive : true, Validators.required],
      urgent: [data.urgent, Validators.required],
      modality: [data.modality, Validators.required],
      referenceKey: [data.referenceKey],
      partitionCode: [data.partitionCode],
      companyCode: [data.companyCode]
    });
  }

  onSave(): void {
    if (this.editForm.valid) {
      // partitionId, companyId, hospitalId disabled olduğu için value'da gelmez, patchle
      const raw = this.editForm.getRawValue();
      this.dialogRef.close({ ...this.data, ...raw });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
