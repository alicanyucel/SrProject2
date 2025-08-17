import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CompanyListModel } from '../../../models/company-list.model';
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
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TurkishPaginatorIntl } from '../../../services/turkish-paginator-intl.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';
import { CompanyUsersDialogComponent } from './company-users-dialog/company-users-dialog.component';
import { HospitalManagementDialogComponent } from './hospital-management-dialog/hospital-management-dialog.component';

const COMPANY_TYPE_MAP: { [key: number]: string } = {
  1: 'Hospital',
  2: 'Other',
  3: 'RadiologyCenter',
  4: 'DiagnosticCenter'
};

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [SharedModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, ReactiveFormsModule, MatStepperModule, MatSelectModule, MatCheckboxModule, MatMenuModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule],
  providers: [
    { provide: MatPaginatorIntl, useClass: TurkishPaginatorIntl }
  ],
  templateUrl: './companies.component.html',  styles: [`
    :host ::ng-deep .mat-mdc-form-field {
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
    /* Company Actions Menu Styles */
    :host ::ng-deep .company-actions-menu .mat-mdc-menu-panel {
      min-width: 160px !important;
      max-width: 200px !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    }
    
    :host ::ng-deep .company-actions-menu .mat-mdc-menu-item {
      height: 44px !important;
      padding: 0 16px !important;
      font-size: 14px !important;
      transition: all 0.2s ease !important;
    }
    
    :host ::ng-deep .company-actions-menu .mat-mdc-menu-item:hover {
      background-color: #f8fafc !important;
    }
    
    :host ::ng-deep .company-actions-menu .mat-mdc-menu-item .mat-icon {
      margin-right: 12px !important;
    }
    
    /* Add User Dialog Panel Styles */
    :host ::ng-deep .add-user-dialog-panel {
      .mat-mdc-dialog-container {
        --mdc-dialog-container-color: white;
        border-radius: 16px !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
      }
      
      .mat-mdc-dialog-surface {
        border-radius: 16px !important;
      }
    }

    /* Company Users Dialog Panel Styles */
    :host ::ng-deep .company-users-dialog-panel {
      .mat-mdc-dialog-container {
        --mdc-dialog-container-color: white;
        border-radius: 16px !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        max-width: 90vw !important;
        max-height: 90vh !important;
      }
      
      .mat-mdc-dialog-surface {
        border-radius: 16px !important;
        overflow: hidden !important;
      }
    }
  `],
  animations: [shake, fuseAnimations]
})
export class CompaniesComponent {
  companies: CompanyListModel[] = [];
  filteredCompanies: CompanyListModel[] = []; // Filtered companies array
  paginatedCompanies: CompanyListModel[] = []; // Companies for current page
  search: string = "";
  // Form groups for stepper
  companyInfoForm: FormGroup;
  contactInfoForm: FormGroup;
  
  // Modal states
  showCreateModal = false;
  showUpdateModal = false;
  showModalAlert = false;
  modalAlert: { id: string; type: string; message: string; timestamp: number } | null = null;
  
  // Stepper states
  isLastStep = false;
  
  // Update mode
  isUpdateMode = false;
  selectedCompany: CompanyListModel | null = null;

  // Pagination
  pageSize = 10;
  pageIndex = 0;
    // Form validation
  loading = false;
  statusFilter: string = '';
  companyTypeFilter: string = '';
  // Firma tipi filtre seçenekleri backend ile birebir uyumlu ve açıklayıcı şekilde güncellendi
  companyTypeList: Array<{id: string, name: string}> = [
    { id: '1', name: 'Hastane' }, // Backend: 1 (Hospital)
    { id: '2', name: 'Teleradyoloji' }, // Backend: 3 (RadiologyCenter)
    { id: '3', name: 'Diğer' }, // Backend: 2 (Other)
    { id: '4', name: 'Tanı Merkezi' } // Backend: 4 (DiagnosticCenter)
  ];
  showHospitalAddModal = false;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    public fuseAlert: GlobalFuseAlertService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {// Initialize company info form (Step 1)
    this.companyInfoForm = this.fb.group({
      companySmallTitle: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      companyTitle: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      taxNo: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/) // Vergi numarası 10 haneli
      ]],
      taxOffice: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      address: ['', [
        Validators.required,
        Validators.minLength(5)
      ]],
      city: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      district: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      webSite: ['']
    });

    // Initialize contact info form (Step 2)
    this.contactInfoForm = this.fb.group({
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9\s\+\-\(\)]+$/) // Phone number pattern
      ]],
      email: ['', [
        Validators.email
      ]],
      representative: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      status: [true], // Default to true (active)
      companyType: ['', [
        Validators.required
      ]]
    });
  }

  ngOnInit(): void {
    this.getAll();
  }
  // Update pagination when search or data changes
  updatePagination() {
    // Filter companies based on search, status, and company type
    this.filteredCompanies = this.companies.filter(company => {
      let matchesSearch = true;
      let matchesStatus = true;
      let matchesType = true;
      if (this.search && this.search.trim() !== '') {
        const searchTerm = this.search.toLowerCase();
        matchesSearch = (
          (company.companySmallTitle && company.companySmallTitle.toLowerCase().includes(searchTerm)) ||
          (company.companyTitle && company.companyTitle.toLowerCase().includes(searchTerm)) ||
          (company.representative && company.representative.toLowerCase().includes(searchTerm)) ||
          (company.taxNo && company.taxNo.toLowerCase().includes(searchTerm)) ||
          (company.taxOffice && company.taxOffice.toLowerCase().includes(searchTerm)) ||
          (company.city && company.city.toLowerCase().includes(searchTerm)) ||
          (company.district && company.district.toLowerCase().includes(searchTerm)) ||
          (company.phoneNumber && company.phoneNumber.toLowerCase().includes(searchTerm)) ||
          (company.email && company.email.toLowerCase().includes(searchTerm)) ||
          (company.address && company.address.toLowerCase().includes(searchTerm)) ||
          (company.webSite && company.webSite.toLowerCase().includes(searchTerm)) ||
          (company.companyType?.name && company.companyType.name.toLowerCase().includes(searchTerm))
        );
      }
      if (this.statusFilter !== '') {
        matchesStatus = (this.statusFilter === 'true') ? company.status === true : company.status === false;
      }
      if (this.companyTypeFilter !== '') {
        // companyTypeFilter (UI id) -> backendValue eşleştirmesi
        // 1: Hastane (1), 2: Teleradyoloji (3), 3: Diğer (2), 4: Tanı Merkezi (4)
        const filterValue = Number(this.companyTypeFilter);
        let backendValue = 0;
        switch (filterValue) {
          case 1: backendValue = 1; break; // Hastane
          case 2: backendValue = 3; break; // Teleradyoloji (RadiologyCenter)
          case 3: backendValue = 2; break; // Diğer (Other)
          case 4: backendValue = 4; break; // Tanı Merkezi (DiagnosticCenter)
        }
        matchesType = (company.companyType?.value === backendValue) || (company.companyTypeValue === backendValue);
      }
      return matchesSearch && matchesStatus && matchesType;
    });

    // Check if current page index is valid after filtering
    const maxPageIndex = Math.max(0, Math.ceil(this.filteredCompanies.length / this.pageSize) - 1);
    if (this.pageIndex > maxPageIndex) {
      this.pageIndex = 0; // Reset to first page if current page is out of bounds
    }

    // Calculate paginated companies
    this.updatePaginatedCompanies();
  }

  // Update paginated companies based on current page
  updatePaginatedCompanies() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCompanies = this.filteredCompanies.slice(startIndex, endIndex);
  }

  // Called when search input changes
  onSearchChange() {
    this.pageIndex = 0; // Always reset to first page when searching
    this.updatePagination();
  }
  getAll() {
    this.http.post<any>("api/Companies/GetAllCompany", {}, (res) => {
      console.log("GetAll Companies Response:", res);
      let companies = [];
      if (res && res.data && Array.isArray(res.data)) {
        companies = res.data;
      } else if (Array.isArray(res)) {
        companies = res;
      } else {
        console.warn("API response format not recognized:", res);
        companies = [];
      }
      // Şirket tipi dönüştürme
      this.companies = companies.map(company => ({
        ...company,
        companyType: company.companyType
          ? { name: COMPANY_TYPE_MAP[company.companyType] || 'Bilinmiyor', value: company.companyType }
          : null
      }));
      this.updatePagination();
    }, (error) => {
      console.error("Error fetching companies:", error);
      this.companies = [];
      this.updatePagination();
    });
  }create() {
    if (this.companyInfoForm.valid && this.contactInfoForm.valid) {
      this.clearModalAlert();
      this.loading = true;      // Create data combining both forms - API format
      const requestData = {
        companySmallTitle: this.companyInfoForm.value.companySmallTitle,
        companyTitle: this.companyInfoForm.value.companyTitle,
        representative: this.contactInfoForm.value.representative,
        phoneNumber: this.contactInfoForm.value.phoneNumber,
        email: this.contactInfoForm.value.email,
        address: this.companyInfoForm.value.address,
        taxNo: this.companyInfoForm.value.taxNo,
        taxOffice: this.companyInfoForm.value.taxOffice,
        webSite: this.companyInfoForm.value.webSite,
        city: this.companyInfoForm.value.city,
        district: this.companyInfoForm.value.district,
        status: this.contactInfoForm.value.status,
        companyTypeValue: this.contactInfoForm.value.companyType ? parseInt(this.contactInfoForm.value.companyType) : 0 // Use companyTypeValue instead of companyType
      };      console.log('Create Request Data:', requestData);
      console.log('Company Type Value:', requestData.companyTypeValue, 'Type:', typeof requestData.companyTypeValue);this.http.post<any>("api/Companies/Create", requestData, (res) => {
        if (res && res.isSuccessful) {
          this.swal.callToast(res.data || 'Şirket başarıyla kaydedildi.', "success");
        } else {
          this.swal.showError('Hata', res && res.errorMessages ? res.errorMessages.join(', ') : 'Bilinmeyen hata');
        }
        this.resetAllForms();
        this.closeModal();
        this.getAll();
        this.loading = false;
      }, (error) => {
        let errorMessage = 'Şirket oluşturulurken bir hata oluştu.';

        // Handle API error response format
        if (error?.error?.ErrorMessages && Array.isArray(error.error.ErrorMessages) && error.error.ErrorMessages.length > 0) {
          errorMessage = error.error.ErrorMessages.join(', ');
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (typeof error === 'object') {
          errorMessage = JSON.stringify(error, null, 2);
        }

        console.log('Create Error Response:', error);
        this.showModalAlertWithAutoDismiss('error', errorMessage, false);
        this.loading = false;
      });
    } else {
      this.companyInfoForm.markAllAsTouched();
      this.contactInfoForm.markAllAsTouched();
      this.showModalAlertWithAutoDismiss('error', 'Lütfen tüm gerekli alanları doğru şekilde doldurunuz.', false);
    }
  }  // Reset all forms
  resetAllForms() {
    this.companyInfoForm.reset();
    this.contactInfoForm.reset();
    this.companyInfoForm.markAsUntouched();
    this.contactInfoForm.markAsUntouched();
    // Reset stepper state
    this.isLastStep = false;
    // Reset default values
    this.contactInfoForm.patchValue({
      status: true
    });
  }

  closeModal() {
    this.showCreateModal = false;
    this.showUpdateModal = false;
    this.clearModalAlert();
    this.resetAllForms();
    this.isUpdateMode = false;
    this.selectedCompany = null;
  }  deleteById(model: CompanyListModel) {
    console.log('Delete company clicked:', model.companySmallTitle);
    
    this.swal.showWarning(
      "Şirketi Sil",
      `${model.companySmallTitle} şirketini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      () => {
        console.log('Confirmed - deleting company');
        this.swal.showLoading('Şirket siliniyor...');
        
        this.http.post<string>("api/Companies/DeleteCompanyById", { companyId: model.id }, (res) => {
          this.swal.hideLoading();
          this.getAll();
          this.swal.showSuccess('Başarılı', 'Şirket başarıyla silindi.');
        }, (error) => {
          this.swal.hideLoading();
          console.error('Error deleting company:', error);
          let errorMessage = 'Şirket silinirken bir hata oluştu.';
          if (error?.error?.message) {
            errorMessage = error.error.message;
          }
          if (typeof errorMessage !== 'string') {
            errorMessage = JSON.stringify(errorMessage, null, 2);
          }
          this.swal.showError('Hata', errorMessage);
        });
      }
    );
    
    console.log('Warning dialog shown');
  }// Edit company - open modal with company data
  editCompany(model: CompanyListModel) {
    this.selectedCompany = model;
    this.isUpdateMode = true;
    this.showUpdateModal = true;
    this.clearModalAlert();
    
    // Reset forms first
    this.resetAllForms();
    
    // Populate company info form with company data
    this.companyInfoForm.patchValue({
      companySmallTitle: model.companySmallTitle,
      companyTitle: model.companyTitle,
      taxNo: model.taxNo,
      taxOffice: model.taxOffice,
      address: model.address,
      city: model.city,
      district: model.district,
      webSite: model.webSite
    });    // Populate contact info form with company data
    this.contactInfoForm.patchValue({
      phoneNumber: model.phoneNumber,
      email: model.email,
      representative: model.representative,
      status: model.status,
      companyType: (model.companyTypeValue !== undefined && model.companyTypeValue !== null)
        ? model.companyTypeValue.toString()
        : (model.companyType?.value ? model.companyType.value.toString() : '')
    });

    // Focus first input after modal opens
    setTimeout(() => {
      const firstInput = document.getElementById('updateCompanySmallTitle');
      if (firstInput) {
        (firstInput as HTMLInputElement).focus();
      }
    }, 100);
  }
  onOpenCreateModal() {
    console.log('Modal açılıyor...');
    this.showCreateModal = true;
    this.isUpdateMode = false;
    this.clearModalAlert();
    this.resetAllForms();
    console.log('showCreateModal:', this.showCreateModal);

    setTimeout(() => {
      const firstInput = document.getElementById('companySmallTitle');
      if (firstInput) {
        (firstInput as HTMLInputElement).focus();
      }
    }, 100);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedCompanies();
  }

  // Check if we're on the last step for stepper
  onStepChange(event: any) {
    this.isLastStep = event.selectedIndex === 1; // 1 is the second step (0-based)
  }

  // Check if update form is valid
  isUpdateFormValid(): boolean {
    return this.companyInfoForm.valid && this.contactInfoForm.valid;
  }

  // Show modal alert with auto-dismiss functionality
  private showModalAlertWithAutoDismiss(type: 'error' | 'success' | 'warning' | 'info', message: string, autoDismiss: boolean = true) {
    // Eğer message bir object ise prettify ile stringe çevir
    if (typeof message === 'object') {
      message = JSON.stringify(message, null, 2);
    }
    this.modalAlert = {
      id: this.generateModalAlertId(),
      type: type,
      message: message,
      timestamp: Date.now()
    };
    this.showModalAlert = true;
    console.log('Modal Alert - Showing:', this.modalAlert);
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
    console.log('Modal Alert - Clearing');
    this.showModalAlert = false;
    this.modalAlert = null;
  }

  // Generate unique ID for modal alerts
  private generateModalAlertId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
  update() {
    if (this.companyInfoForm.valid && this.contactInfoForm.valid && this.selectedCompany) {
      this.clearModalAlert();
      this.loading = true;      // Create update data in the exact format API expects
      const updateData = {
        id: this.selectedCompany.id,
        companySmallTitle: this.companyInfoForm.value.companySmallTitle,
        companyTitle: this.companyInfoForm.value.companyTitle,
        representative: this.contactInfoForm.value.representative,
        phoneNumber: this.contactInfoForm.value.phoneNumber,
        email: this.contactInfoForm.value.email,
        address: this.companyInfoForm.value.address,
        taxNo: this.companyInfoForm.value.taxNo,
        taxOffice: this.companyInfoForm.value.taxOffice,
        webSite: this.companyInfoForm.value.webSite,
        city: this.companyInfoForm.value.city,
        district: this.companyInfoForm.value.district,
        status: this.contactInfoForm.value.status,
        companyTypeValue: this.contactInfoForm.value.companyType ? parseInt(this.contactInfoForm.value.companyType) : 0 // Use companyTypeValue instead of companyType
      };

      console.log('Update Request Data:', updateData);
      console.log('Company Type Value:', updateData.companyTypeValue, 'Type:', typeof updateData.companyTypeValue);this.http.post<string>("api/Companies/UpdateCompany", updateData, (res) => {
        this.swal.callToast('Şirket bilgileri güncellendi.', "success");
        this.resetAllForms();
        this.closeModal();
        this.getAll(); // Refresh the list
        this.loading = false;
      }, (error) => {
        this.loading = false;
        let errorMessage = 'Şirket güncellenirken bir hata oluştu.';

        // Handle API error response format
        if (error?.error?.ErrorMessages && Array.isArray(error.error.ErrorMessages) && error.error.ErrorMessages.length > 0) {
          errorMessage = error.error.ErrorMessages.join(', ');
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (typeof error === 'object') {
          errorMessage = JSON.stringify(error, null, 2);
        }

        console.log('Update Error Response:', error);
        this.showModalAlertWithAutoDismiss('error', errorMessage, false);
      });
    } else {
      this.companyInfoForm.markAllAsTouched();
      this.contactInfoForm.markAllAsTouched();
      this.showModalAlertWithAutoDismiss('error', 'Lütfen tüm gerekli alanları doğru şekilde doldurunuz.', false);
    }
  }

  // Şirkete kullanıcı ekle
  addUserToCompany(company: CompanyListModel) {
    if (this.dialog && AddUserDialogComponent) {
      this.dialog.open(AddUserDialogComponent, {
        width: '500px',
        data: { company },
        panelClass: 'add-user-dialog-panel'
      });
    } else {
      this.swal.callToast('Kullanıcı ekleme dialogu tanımlı değil.', 'info');
    }
  }

  // Şirket kullanıcılarını görüntüle
  viewCompanyUsers(company: CompanyListModel) {
    if (this.dialog && CompanyUsersDialogComponent) {
      this.dialog.open(CompanyUsersDialogComponent, {
        width: '700px',
        data: { company },
        panelClass: 'company-users-dialog-panel'
      });
    } else {
      this.swal.callToast('Şirket kullanıcıları dialogu tanımlı değil.', 'info');
    }
  }

  // Hastane ekle veya listele dialogu (şirkete hastane ekle/listele) - company parametresi ile
  openHospitalListDialog(company: any) {
    try {
      this.selectedCompany = company;
      if (this.dialog && HospitalManagementDialogComponent) {
        this.dialog.open(HospitalManagementDialogComponent, {
          width: '90vw',
          height: '90vh',
          maxWidth: '98vw',
          maxHeight: '98vh',
          panelClass: 'company-users-dialog-panel',
          data: { company: this.selectedCompany },
          autoFocus: false,
          restoreFocus: false,
          scrollStrategy: null // Modal içi scroll'u devre dışı bırak
        });
      } else {
        this.swal.callToast('Hastane ekleme dialogu tanımlı değil veya import edilmemiş.', 'info');
      }
    } catch (e) {
      this.swal.callToast('Hastane ekleme modalı açılırken hata oluştu: ' + (e?.message || e), 'error');
    }
  }

  // Şirkete bağlı hastaneleri görüntüle (artık dialog açacak)
  viewHospitalsModal(company: any) {
    this.openHospitalListDialog(company);
  }

  closeHospitalAddModal() {
    this.showHospitalAddModal = false;
  }
}
