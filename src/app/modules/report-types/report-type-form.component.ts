import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-report-type-form',
  templateUrl: './report-type-form.component.html',
  styleUrls: ['./report-type-form.component.scss']
})
export class ReportTypeFormComponent {
  form: FormGroup;
  modalities: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReportTypeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.modalities = data.modalities || [];
    this.form = this.fb.group({
      reportName: [data.name || '', Validators.required],
      emergency: [data.emergency || false, Validators.required],
      modalityType: [data.modality || '', Validators.required],
      templateId: [data.templateId || '', Validators.required]
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
