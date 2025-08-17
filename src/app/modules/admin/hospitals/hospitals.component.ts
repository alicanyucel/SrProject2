import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { HospitalListModel, CreateHospitalRequest, UpdateHospitalRequest } from '../../../models/hospital.model';
import { HttpService } from '../../../services/http.service';
import { SwalService } from '../../../services/swal.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GlobalFuseAlertService } from '../../../services/fuse-alert.service';
import { shake } from '@fuse/animations/shake';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';
import { fuseAnimations } from '@fuse/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TurkishPaginatorIntl } from '../../../services/turkish-paginator-intl.service';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-hospitals',
  standalone: true,
  imports: [SharedModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, ReactiveFormsModule, MatStepperModule, MatCheckboxModule, MatMenuModule, MatSelectModule, MatOptionModule],
  providers: [
    { provide: MatPaginatorIntl, useClass: TurkishPaginatorIntl }
  ],
  templateUrl: './hospitals.component.html',
  styles: [`    :host ::ng-deep .mat-mdc-form-field {
      width: 100% !important;
    }
    
    :host ::ng-deep .mat-mdc-form-field .mat-mdc-floating-label {
      transform-origin: left top !important;
      transform: translateY(-50%) scale(0.75) !important;
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    :host ::ng-deep .mat-mdc-form-field:not(.mat-mdc-form-field-has-icon-prefix) .mat-mdc-floating-label {
      left: 16px !important;
    }
    
    :host ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-floating-label,
    :host ::ng-deep .mat-mdc-form-field.mat-mdc-form-field-should-float .mat-mdc-floating-label {
      transform: translateY(-106%) scale(0.75) !important;
    }
    
    .name-fields-container {
      display: flex;
      gap: 1rem;
      width: 100%;
    }
    
    .name-field-wrapper {
      flex: 1;
      min-width: 0;
      max-width: 50%;
    }
      /* Hospital Actions Menu Styles */
    :host ::ng-deep .hospital-actions-menu .mat-mdc-menu-panel {
      min-width: 160px !important;
      max-width: 200px !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    }
    
    :host ::ng-deep .hospital-actions-menu .mat-mdc-menu-item {
      height: 44px !important;
      padding: 0 16px !important;
      font-size: 14px !important;
      transition: all 0.2s ease !important;
    }
    
    :host ::ng-deep .hospital-actions-menu .mat-mdc-menu-item:hover {
      background-color: #f8fafc !important;
    }
    
    :host ::ng-deep .hospital-actions-menu .mat-mdc-menu-item .mat-icon {
      margin-right: 12px !important;
    }
  `],
  animations: [shake, fuseAnimations]
})
export class HospitalsComponent {
  hospitals: HospitalListModel[] = [];
  filteredHospitals: HospitalListModel[] = [];
  paginatedHospitals: HospitalListModel[] = [];
  search: string = "";

  // Filtre değişkenleri
  statusFilter: string = '';
  cityFilter: string = '';
  districtFilter: string = '';
  cityList: string[] = [];
  districtList: string[] = [];

  // Stepper form groups
  hospitalInfoForm: FormGroup;
  contactInfoForm: FormGroup;

  // Modal states
  showCreateModal = false;
  showUpdateModal = false;
  showModalAlert = false;
  modalAlert: { id: string; type: string; message: string; timestamp: number } | null = null;
  
  // Update mode
  isUpdateMode = false;
  selectedHospital: HospitalListModel | null = null;

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  
  // Form validation
  loading = false;

  // Stepper control
  isLastStep = false;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    public fuseAlert: GlobalFuseAlertService,
    private fb: FormBuilder
  ) {
    // Initialize stepper forms
    this.hospitalInfoForm = this.fb.group({
      shortName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      fullTitle: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200)
      ]],
      authorizedPerson: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      city: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      district: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]]
    });    this.contactInfoForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10,11}$/)
      ]],
      address: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      taxNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10,11}$/)
      ]],
      taxOffice: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]],
      website: ['', [
        Validators.required
      ]],
      isActive: [true]
    });

    this.getAll();
  }

  ngOnInit(): void {
    this.updateCityAndDistrictLists();
    this.updatePaginatedHospitals();
  }

  getAll(): void {
    this.http.post<any>("api/Hospitals/GetAllHospitals", {}, (response) => {
      console.log("GetAll Hospitals Response:", response);
      
      // Handle different response formats
      let hospitals = [];
      if (response && response.data && Array.isArray(response.data)) {
        // API returns {data: [], errorMessages: null, isSuccessful: true}
        hospitals = response.data;
      } else if (Array.isArray(response)) {
        // API returns direct array
        hospitals = response;
      } else {
        console.warn("API response format not recognized:", response);
        hospitals = [];
      }
      
      this.hospitals = hospitals;
      this.filteredHospitals = [...this.hospitals];
      this.updateCityAndDistrictLists();
      this.updatePaginatedHospitals();
    }, (error) => {
      console.error('Error fetching hospitals:', error);
      this.hospitals = [];
      this.filteredHospitals = [];
      this.updateCityAndDistrictLists();
      this.updatePaginatedHospitals();
      this.fuseAlert.showAlert('error', 'Hastaneler yüklenirken bir hata oluştu.');
    });
  }

  // Şehir ve ilçe listesini güncelle
  updateCityAndDistrictLists(): void {
    const cities = new Set<string>();
    const districts = new Set<string>();
    this.hospitals.forEach(hospital => {
      if (hospital.city) cities.add(hospital.city);
      if (hospital.district) districts.add(hospital.district);
    });
    this.cityList = Array.from(cities).sort();
    this.districtList = Array.from(districts).sort();
  }

  // Filtreleme fonksiyonları
  onStatusFilterChange(): void {
    this.applyFilters();
  }
  onCityFilterChange(): void {
    this.districtList = this.hospitals
      .filter(h => !this.cityFilter || h.city === this.cityFilter)
      .map(h => h.district)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .sort();
    this.districtFilter = '';
    this.applyFilters();
  }
  onDistrictFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.hospitals];
    // Metin arama
    if (this.search && this.search.trim() !== '') {
      const searchTerm = this.search.toLowerCase().trim();
      filtered = filtered.filter(hospital =>
        (hospital.shortName && hospital.shortName.toLowerCase().includes(searchTerm)) ||
        (hospital.fullTitle && hospital.fullTitle.toLowerCase().includes(searchTerm)) ||
        (hospital.authorizedPerson && hospital.authorizedPerson.toLowerCase().includes(searchTerm)) ||
        (hospital.city && hospital.city.toLowerCase().includes(searchTerm)) ||
        (hospital.district && hospital.district.toLowerCase().includes(searchTerm)) ||
        (hospital.email && hospital.email.toLowerCase().includes(searchTerm)) ||
        (hospital.phone && hospital.phone.toLowerCase().includes(searchTerm))
      );
    }
    // Durum filtresi
    if (this.statusFilter !== '') {
      filtered = filtered.filter(h => String(h.isActive) === this.statusFilter);
    }
    // Şehir filtresi
    if (this.cityFilter !== '') {
      filtered = filtered.filter(h => h.city === this.cityFilter);
    }
    // İlçe filtresi
    if (this.districtFilter !== '') {
      filtered = filtered.filter(h => h.district === this.districtFilter);
    }
    this.filteredHospitals = filtered;
    this.pageIndex = 0;
    this.updatePaginatedHospitals();
  }

  updatePaginatedHospitals(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedHospitals = this.filteredHospitals.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedHospitals();
  }

  // Reset all stepper forms
  resetAllForms() {
    this.hospitalInfoForm.reset();
    this.contactInfoForm.reset();

    // Set default values after reset
    this.contactInfoForm.patchValue({
      isActive: true
    });

    this.hospitalInfoForm.markAsUntouched();
    this.contactInfoForm.markAsUntouched();

    this.isLastStep = false;
  }

  // Check if we're on the last step
  onStepChange(event: any) {
    this.isLastStep = event.selectedIndex === 1; // 1 is the second step (0-based)
  }

  closeModal() {
    this.showCreateModal = false;
    this.showUpdateModal = false;
    this.clearModalAlert();
    this.resetAllForms();
    this.isUpdateMode = false;
    this.selectedHospital = null;
  }

  deleteById(model: HospitalListModel) {
    console.log('Delete hospital clicked:', model.shortName, model.fullTitle);
    
    this.swal.showWarning(
      "Hastaneyi Sil",
      `${model.shortName} - ${model.fullTitle} hastanesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      () => {
        this.swal.showLoading('Hastane siliniyor...');
        
        this.http.post<string>("api/Hospitals/DeleteHospitalById", { id: model.id }, (res) => {
          this.swal.hideLoading();
          this.getAll();
          this.swal.showSuccess('Başarılı', 'Hastane başarıyla silindi.');
        }, (error) => {
          this.swal.hideLoading();
          let errorMessage = 'Hastane silinirken bir hata oluştu.';
          if (error?.error?.message) {
            errorMessage = error.error.message;
          }
          this.swal.showError('Hata', errorMessage);
        });
      }
    );
  }

  // Edit hospital - open modal with hospital data
  editHospital(model: HospitalListModel) {
    this.selectedHospital = model;
    this.isUpdateMode = true;
    this.showUpdateModal = true;
    this.clearModalAlert();
    
    this.resetAllForms();
    
    this.hospitalInfoForm.patchValue({
      shortName: model.shortName,
      fullTitle: model.fullTitle,
      authorizedPerson: model.authorizedPerson,
      city: model.city,
      district: model.district
    });
      this.contactInfoForm.patchValue({
      email: model.email,
      phone: model.phone,
      address: model.address,
      taxNumber: model.taxNumber,
      taxOffice: model.taxOffice,
      website: model.website,
      isActive: model.isActive
    });

    // Focus first input after modal opens
    setTimeout(() => {
      const firstInput = document.getElementById('updateShortName');
      if (firstInput) {
        (firstInput as HTMLInputElement).focus();
      }
    }, 100);
  }

  onOpenCreateModal() {
    this.showCreateModal = true;
    this.isUpdateMode = false;
    this.clearModalAlert();
    this.resetAllForms();

    setTimeout(() => {
      const firstInput = document.getElementById('shortName');
      if (firstInput) {
        (firstInput as HTMLInputElement).focus();
      }
    }, 100);
  }

  create(): void {
    if (this.hospitalInfoForm.invalid || this.contactInfoForm.invalid) {
      this.showModalAlertWithAutoDismiss('error', 'Lütfen tüm zorunlu alanları doğru şekilde doldurunuz.');
      return;
    }

    this.loading = true;
    this.clearModalAlert();

    const hospitalData: CreateHospitalRequest = {
      ...this.hospitalInfoForm.value,
      ...this.contactInfoForm.value
    };    this.http.post<any>("api/Hospitals/CreateHospital", hospitalData, (response) => {
      this.loading = false;
      this.getAll();
      this.closeModal();
      // Extract the message from the response data
      const message = response?.data || response || 'Hastane başarıyla eklendi';
      this.swal.callToast(message, "success");
    }, (error) => {
      this.loading = false;
      let errorMessage = 'Hastane eklenirken bir hata oluştu.';
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.error?.errorMessages && Array.isArray(error.error.errorMessages)) {
        errorMessage = error.error.errorMessages.join('\n');
      }
      this.showModalAlertWithAutoDismiss('error', errorMessage);
    });
  }

  update(): void {
    if (!this.selectedHospital) {
      this.showModalAlertWithAutoDismiss('error', 'Güncellenecek hastane bulunamadı.');
      return;
    }

    if (this.hospitalInfoForm.invalid || this.contactInfoForm.invalid) {
      this.showModalAlertWithAutoDismiss('error', 'Lütfen tüm zorunlu alanları doğru şekilde doldurunuz.');
      return;
    }

    this.loading = true;
    this.clearModalAlert();

    const updateData: UpdateHospitalRequest = {
      id: this.selectedHospital.id,
      ...this.hospitalInfoForm.value,
      ...this.contactInfoForm.value
    };    this.http.post<any>("api/Hospitals/UpdateHospital", updateData, (response) => {
      this.loading = false;
      this.getAll();
      this.closeModal();
      // Extract the message from the response data
      const message = response?.data || response || 'Hastane başarıyla güncellendi';
      this.swal.callToast(message, "success");
    }, (error) => {
      this.loading = false;
      let errorMessage = 'Hastane güncellenirken bir hata oluştu.';
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.error?.errorMessages && Array.isArray(error.error.errorMessages)) {
        errorMessage = error.error.errorMessages.join('\n');
      }
      this.showModalAlertWithAutoDismiss('error', errorMessage);
    });
  }

  // Show modal alert with auto-dismiss functionality
  private showModalAlertWithAutoDismiss(type: 'error' | 'success' | 'warning' | 'info', message: string, autoDismiss: boolean = true) {
    this.modalAlert = {
      id: this.generateModalAlertId(),
      type: type,
      message: message,
      timestamp: Date.now()
    };
    this.showModalAlert = true;

    // Auto-dismiss after 5 seconds if enabled
    if (autoDismiss) {
      setTimeout(() => {
        if (this.modalAlert && this.modalAlert.id === this.modalAlert.id) {
          this.clearModalAlert();
        }
      }, 5000);
    }
  }

  // Clear modal alert
  private clearModalAlert() {
    this.showModalAlert = false;
    this.modalAlert = null;
  }

  // Generate unique ID for modal alerts
  private generateModalAlertId(): string {
    return 'alert-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  togglePasswordVisibility(): void {
    // Not needed for hospitals but keeping for consistency
  }

  toggleConfirmPasswordVisibility(): void {
    // Not needed for hospitals but keeping for consistency
  }
}
