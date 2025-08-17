import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../../../services/http.service';
import { SwalService } from '../../../../services/swal.service';
import { FuseAlertComponent } from '@fuse/components/alert';
import { MatDialog } from '@angular/material/dialog';
import { HospitalPartitionEditDialogComponent } from './hospital-partition-edit-dialog.component';

export interface HospitalPartition {
  id?: string;
  partitionName: string;
  urgent: boolean;
  modality: string;
  referenceKey?: string;
  partitionCode?: string;
  companyCode?: string;
  companyId: string;
  hospitalId: string;
  createdDate?: string;
  isActive?: boolean;
}

export interface HospitalManagementDialogData {
  companyId: string;
  companyName: string;
  viewOnly?: boolean;
}

@Component({
  selector: 'app-hospital-management-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTooltipModule,
    FuseAlertComponent
  ],
  providers: [HttpService],
  templateUrl: './hospital-management-dialog.component.html',
  styleUrls: ['./hospital-management-dialog.component.scss']
})
export class HospitalManagementDialogComponent implements OnInit {
  hospitals: HospitalPartition[] = [];
  filteredHospitals: HospitalPartition[] = [];
  paginatedHospitals: HospitalPartition[] = [];
  addForm: FormGroup;
  
  // Loading states
  loading = false;
  adding = false;
  
  // Search functionality
  hospitalSearch = '';
  
  // Pagination
  pageSize = 5;
  pageIndex = 0;
  
  // Form alert
  showFormAlert = false;
  formAlert: { type: string; message: string } | null = null;

  constructor(
    public dialogRef: MatDialogRef<HospitalManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HospitalManagementDialogData,
    private fb: FormBuilder,
    private http: HttpService,
    private swal: SwalService,
    private dialog: MatDialog
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadHospitals();
  }

  private initializeForm(): void {
    const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    this.addForm = this.fb.group({
      partitionName: ['', Validators.required],
      urgent: [false],
      modality: ['', Validators.required],
      referenceKey: [''],
      partitionCode: [''],
      companyCode: [''],
      companyId: [this.data.companyId, [Validators.required, Validators.pattern(guidPattern)]],
      hospitalId: ['', [Validators.required, Validators.pattern(guidPattern)]]
    });
  }

  private loadHospitals(): void {
    this.loading = true;
    const filter = { companyId: this.data.companyId };
    this.http.getAllCompanyHospitalPartitions(filter, (response) => {
      this.loading = false;
      // API response yapısına göre düzeltildi
      let hospitals: any[] = [];
      if (response && Array.isArray(response)) {
        hospitals = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        hospitals = response.data;
      } else if (response && Array.isArray(response.result)) {
        hospitals = response.result;
      } else {
        hospitals = [];
      }
      this.hospitals = hospitals;
      this.filteredHospitals = [...this.hospitals];
      this.updatePaginatedHospitals();
      console.log('Hospitals:', this.hospitals);
    }, (error) => {
      this.loading = false;
      this.hospitals = [];
      this.filteredHospitals = [];
      this.updatePaginatedHospitals();
      console.error('Error loading hospitals:', error);
    });
  }

  onHospitalSearchChange(): void {
    if (!this.hospitalSearch || this.hospitalSearch.trim() === '') {
      this.filteredHospitals = [...this.hospitals];
    } else {
      const searchTerm = this.hospitalSearch.toLowerCase().trim();
      this.filteredHospitals = this.hospitals.filter(hospital =>
        hospital.partitionName.toLowerCase().includes(searchTerm) ||
        hospital.modality.toLowerCase().includes(searchTerm) ||
        (hospital.partitionCode && hospital.partitionCode.toLowerCase().includes(searchTerm)) ||
        (hospital.companyCode && hospital.companyCode.toLowerCase().includes(searchTerm))
      );
    }
    
    this.pageIndex = 0;
    this.updatePaginatedHospitals();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedHospitals();
  }

  private updatePaginatedHospitals(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedHospitals = this.filteredHospitals.slice(startIndex, endIndex);
  }

  onAddHospital(): void {
    if (this.addForm.invalid) {
      Object.keys(this.addForm.controls).forEach(key => {
        this.addForm.get(key)?.markAsTouched();
      });
      this.showFormAlertWithAutoDismiss('error', 'Lütfen tüm zorunlu alanları doğru formatta doldurun.');
      return;
    }
    this.adding = true;
    this.clearFormAlert();

    // Partition ekleme API'si ile gönderilecek veri
    const partitionData = {
      ...this.addForm.value,
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      partitionId: this.generateGuid() // Otomatik GUID üretiliyor
    };
    this.http.createCompanyHospitalPartition(
      partitionData,
      (response) => {
        this.adding = false;
        this.swal.callToast('Bölüm başarıyla eklendi!', 'success');
        // SweetAlert ile büyük popup göster
        this.swal.showSuccess('Partition başarıyla eklendi!');
        this.resetForm();
        this.loadHospitals();
        this.showFormAlertWithAutoDismiss('success', 'Bölüm başarıyla eklendi!');
      },
      (error) => {
        this.adding = false;
        const errorMessage = error?.error?.message || 'Bölüm eklenirken bir hata oluştu.';
        this.showFormAlertWithAutoDismiss('error', errorMessage);
      }
    );
  }

  editHospital(hospital: HospitalPartition): void {
    const dialogRef = this.dialog.open(HospitalPartitionEditDialogComponent, {
      width: '90vw',
      maxWidth: '900px',
      height: 'auto',
      panelClass: 'hospital-partition-edit-dialog-panel',
      data: { ...hospital }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Sadece API'nin beklediği alanları gönder
        const updatedPartition = {
          partitionId: hospital.id || result.partitionId,
          companyId: result.companyId || hospital.companyId,
          hospitalId: result.hospitalId || hospital.hospitalId,
          partitionName: result.partitionName || hospital.partitionName,
          isActive: result.isActive !== undefined ? result.isActive : (hospital.isActive ?? true),
          urgent: result.urgent !== undefined ? result.urgent : hospital.urgent,
          modality: result.modality || hospital.modality,
          referenceKey: result.referenceKey || hospital.referenceKey,
          partitionCode: result.partitionCode || hospital.partitionCode,
          companyCode: result.companyCode || hospital.companyCode
        };
        this.http.updateCompanyHospitalPartition(updatedPartition, (response) => {
          if (response && response.isSuccessful === false) {
            this.swal.showError('Güncellenemedi!', response?.message || 'Bir hata oluştu.');
          } else {
            this.swal.showSuccess('Bölüm başarıyla güncellendi!');
            this.loadHospitals();
            this.dialogRef.close(true); // Modalı kapat ve ana sayfada getAll tetiklensin
          }
        }, (error) => {
          this.swal.showSuccess('Güncellendi');
          this.loadHospitals();
        });
      }
    });
  }

  deleteHospital(hospital: HospitalPartition): void {
    this.swal.showWarning(
      'Hastaneyi Sil',
      `${hospital.partitionName} - ${hospital.modality} bölümünü silmek istediğinizden emin misiniz?`,
      () => {
        // Silme API çağrısı
        this.http.deleteCompanyHospitalPartition(
          hospital.id!,
          (response) => {
            this.swal.showSuccess('Hastane başarıyla silindi!');
            this.loadHospitals();
          },
          (error) => {
            this.swal.showError('Hastane silinemedi!', error?.error?.message || 'Bir hata oluştu.');
          }
        );
      }
    );
  }

  resetForm(): void {
    this.addForm.reset();
    this.addForm.patchValue({
      urgent: false,
      companyId: this.data.companyId || ''
    });
    this.clearFormAlert();
  }

  fillTestData(): void {
    const testCompanyId = this.data.companyId || '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    this.addForm.patchValue({
      partitionName: 'Radyoloji Bölümü',
      urgent: true,
      modality: 'CT',
      referenceKey: 'REF-2024-001',
      partitionCode: 'RAD001',
      companyCode: 'COMP001',
      companyId: testCompanyId,
      hospitalId: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    });
    this.showFormAlertWithAutoDismiss('info', 'Test verileri dolduruldu. Formu gözden geçirip gönderebilirsiniz.');
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private showFormAlertWithAutoDismiss(type: string, message: string): void {
    this.formAlert = { type, message };
    this.showFormAlert = true;

    setTimeout(() => {
      this.clearFormAlert();
    }, 5000);
  }

  private clearFormAlert(): void {
    this.showFormAlert = false;
    this.formAlert = null;
  }

  private generateGuid(): string {
    // RFC4122 version 4 compliant UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
