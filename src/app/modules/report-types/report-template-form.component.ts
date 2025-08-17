import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-report-template-form',
  templateUrl: './report-template-form.component.html',
  styleUrls: ['./report-template-form.component.scss']
})
export class ReportTemplateFormComponent {
  form: FormGroup;
  reportTypeName: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReportTemplateFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.reportTypeName = data.reportTypeName;
    this.form = this.fb.group({
      name: ['', Validators.required],
      template: ['', Validators.required]
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
