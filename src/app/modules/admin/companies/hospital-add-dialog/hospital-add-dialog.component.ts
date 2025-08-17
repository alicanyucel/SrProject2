import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from '../../../../services/http.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-hospital-add-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatCheckboxModule],
  template: `
    <h2 class="text-xl font-bold mb-4">Hastane Ekle</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-3">
      <input class="border p-1" placeholder="Kullanıcı ID" formControlName="userId" required />
      <input class="border p-1" placeholder="Partition Adı" formControlName="partitionName" required />
      <input class="border p-1" placeholder="Modality" formControlName="modality" required />
      <input class="border p-1" placeholder="Referans Key" formControlName="referenceKey" />
      <input class="border p-1" placeholder="Partition Kodu" formControlName="partitionCode" />
      <input class="border p-1" placeholder="Company Code" formControlName="companyCode" />
      <input class="border p-1" placeholder="Hospital ID" formControlName="hospitalId" required />
      <label class="flex items-center gap-2">
        <input type="checkbox" formControlName="urgent" /> Acil mi?
      </label>
      <button mat-flat-button color="primary" type="submit" [disabled]="loading">Kaydet</button>
    </form>
  `
})
export class HospitalAddDialogComponent {
  form: FormGroup;
  loading = false;
  constructor(
    private dialogRef: MatDialogRef<HospitalAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      userId: ['', Validators.required],
      partitionName: ['', Validators.required],
      urgent: [false],
      modality: ['', Validators.required],
      referenceKey: [''],
      partitionCode: [''],
      companyCode: [''],
      companyId: [data.company?.id || '', Validators.required],
      hospitalId: ['', Validators.required]
    });
  }
  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.http.createHospitalUserPartition(this.form.value, res => {
      this.loading = false;
      this.dialogRef.close({ success: true, data: res });
    }, err => {
      this.loading = false;
      alert('Hata: ' + (err?.error?.message || 'Bilinmeyen hata'));
    });
  }
}
