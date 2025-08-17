import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { MatDialog } from '@angular/material/dialog';
import { PartitionEditDialogComponent } from './partition-edit-dialog.component';

export interface Hospital {
  id: string;
  name: string;
  city: string;
  district: string;
  phone: string;
  partitionId?: string; // partitionId eklendi
}

@Component({
  selector: 'app-hospital-list-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
  providers: [HttpService],
  template: `
    <div class="p-6 w-full max-w-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Hastane Listesi</h2>
        <button mat-icon-button (click)="close()" aria-label="Kapat">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div *ngIf="hospitals.length === 0" class="text-gray-500 text-center py-8">
        Kayıtlı hastane yok.
      </div>
      <div *ngIf="hospitals.length > 0">
        <table class="w-full text-sm border">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 text-left">Adı</th>
              <th class="p-2 text-left">Şehir</th>
              <th class="p-2 text-left">İlçe</th>
              <th class="p-2 text-left">Telefon</th>
              <th class="p-2 text-left">İşlem</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let hospital of hospitals" class="border-t">
              <td class="p-2">{{ hospital.name }}</td>
              <td class="p-2">{{ hospital.city }}</td>
              <td class="p-2">{{ hospital.district }}</td>
              <td class="p-2">{{ hospital.phone }}</td>
              <td class="p-2">
                <button mat-icon-button color="primary" (click)="editHospital(hospital)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteHospital(hospital)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-6" *ngIf="!data?.viewOnly">
        <form [formGroup]="addForm" (ngSubmit)="onAddHospital()" class="flex flex-col gap-2 mb-4">
          <input class="border p-1" placeholder="Kullanıcı ID (Guid)" formControlName="userId" required />
          <input class="border p-1" placeholder="Bölüm Adı" formControlName="partitionName" required />
          <label class="flex items-center gap-2">
            <input type="checkbox" formControlName="urgent" /> Acil mi?
          </label>
          <input class="border p-1" placeholder="Modalite" formControlName="modality" required />
          <input class="border p-1" placeholder="Referans Anahtarı" formControlName="referenceKey" />
          <input class="border p-1" placeholder="Bölüm Kodu" formControlName="partitionCode" />
          <input class="border p-1" placeholder="Şirket Kodu" formControlName="companyCode" />
          <input class="border p-1" placeholder="Şirket ID (Guid)" formControlName="companyId" required />
          <input class="border p-1" placeholder="Hastane ID (Guid)" formControlName="hospitalId" required />
          <button mat-flat-button color="primary" type="submit" [disabled]="addForm.invalid || adding">Kaydet</button>
        </form>
      </div>
    </div>
  `
})
export class HospitalListDialogComponent implements OnInit {
  hospitals: Hospital[] = [];
  addForm: FormGroup;
  adding = false;
  deletingPartitionId: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<HospitalListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private http: HttpService,
    private dialog: MatDialog
  ) {
    this.addForm = this.fb.group({
      userId: ['', Validators.required],
      partitionName: ['', Validators.required],
      urgent: [false],
      modality: ['', Validators.required],
      referenceKey: [''],
      partitionCode: [''],
      companyCode: [''],
      companyId: ['', Validators.required],
      hospitalId: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Şirket ID varsa filtre ile API'den hastaneleri çek
    const filter = this.data?.companyId ? { companyId: this.data.companyId } : {};
    this.http.getAllHospitalUserPartitions(filter, res => {
      let hospitals = [];
      if (res && res.data && Array.isArray(res.data)) {
        hospitals = res.data;
      } else if (Array.isArray(res)) {
        hospitals = res;
      } else {
        hospitals = [];
      }
      console.log('API hospital list:', hospitals);
      // Her hospital'ın partitionId'sini logla
      hospitals.forEach(h => console.log('hospital:', h.name, 'partitionId:', h.partitionId, 'id:', h.id));
      // partitionId yoksa id'yi partitionId olarak ata
      hospitals = hospitals.map(h => ({ ...h, partitionId: h.partitionId || h.id }));
      this.hospitals = hospitals;
    }, err => {
      this.hospitals = [];
    });
  }

  close() {
    this.dialogRef.close();
  }

  onAddHospital() {
    if (this.addForm.invalid) return;
    this.adding = true;
    // partitionId otomatik GUID olarak ekleniyor
    const guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    const data = { ...this.addForm.value, partitionId: guid };
    this.http.createHospitalUserPartition(data, res => {
      alert('Hastane başarıyla eklendi!');
      this.adding = false;
      this.addForm.reset();
      // İsterseniz yeni eklenen hastaneyi listeye ekleyebilirsiniz
    }, err => {
      alert('Hata: ' + (err?.error?.message || 'Bilinmeyen hata'));
      this.adding = false;
    });
  }

  deleteHospital(hospital: Hospital) {
    // Sadece partitionId gönderilecek
    const partitionId = hospital.id;
    if (!partitionId) {
      alert('Silinecek kaydın id değeri yok!');
      return;
    }
    const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidPattern.test(partitionId)) {
      alert('id GUID formatında değil: ' + partitionId);
      return;
    }
    if (this.deletingPartitionId === partitionId) return; // Çift tıklama koruması
    if (!confirm('Bu hastaneyi silmek istediğinize emin misiniz?\npartitionId: ' + partitionId)) return;
    this.deletingPartitionId = partitionId;
    this.http.deleteCompanyHospitalPartition(partitionId, res => {
      alert('Hastane başarıyla silindi!');
      this.deletingPartitionId = null;
      this.ngOnInit(); // Listeyi API'den tekrar çek
    }, err => {
      alert('Silinemedi: ' + (err?.error?.message || 'Bilinmeyen hata'));
      this.deletingPartitionId = null;
    });
  }

  async editHospital(hospital: Hospital) {
    const partition = (hospital as any).partition || null;
    if (!partition || !partition.id) {
      alert('Düzenlenecek kaydın partition objesi veya id değeri yok!');
      return;
    }
    const dialogRef = this.dialog.open(PartitionEditDialogComponent, {
      width: '400px',
      data: { ...partition }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedPartition = {
          ...partition,
          ...result,
          updatedAt: new Date().toISOString()
        };
        this.http.updateCompanyHospitalPartition(updatedPartition, res => {
          alert('Hastane bölümü başarıyla güncellendi!');
          this.ngOnInit();
        }, err => {
          alert('Güncellenemedi: ' + (err?.error?.message || 'Bilinmeyen hata'));
        });
      }
    });
  }
}
