import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { UserListModel } from '../../../models/user-list.model';
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
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TurkishPaginatorIntl } from '../../../services/turkish-paginator-intl.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [SharedModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, ReactiveFormsModule, MatStepperModule, MatSelectModule, MatCheckboxModule, MatMenuModule],
  providers: [
    { provide: MatPaginatorIntl, useClass: TurkishPaginatorIntl }
  ],
  templateUrl: './users.component.html',
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
      /* User Actions Menu Styles */
    :host ::ng-deep .user-actions-menu .mat-mdc-menu-panel {
      min-width: 160px !important;
      max-width: 200px !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    }
    
    :host ::ng-deep .user-actions-menu .mat-mdc-menu-item {
      height: 44px !important;
      padding: 0 16px !important;
      font-size: 14px !important;
      transition: all 0.2s ease !important;
    }
    
    :host ::ng-deep .user-actions-menu .mat-mdc-menu-item:hover {
      background-color: #f8fafc !important;
    }
    
    :host ::ng-deep .user-actions-menu .mat-mdc-menu-item .mat-icon {
      margin-right: 12px !important;
    }
  `],
  animations: [shake, fuseAnimations]
})
export class UsersComponent {
  users: UserListModel[] = [];
  filteredUsers: UserListModel[] = []; // Filtered users array
  paginatedUsers: UserListModel[] = []; // Users for current page
  search: string = "";

  // Stepper form groups
  personalInfoForm: FormGroup;
  loginInfoForm: FormGroup;  // Modal states
  showCreateModal = false;
  showUpdateModal = false;
  showModalAlert = false;
  modalAlert: { id: string; type: string; message: string; timestamp: number } | null = null;
  
  // Update mode
  isUpdateMode = false;
  selectedUser: UserListModel | null = null;

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  // Form validation
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  // Stepper control
  isLastStep = false;  // Filtreler
  statusFilter: string = '';
  roleFilter: string = '';
  companyFilter: string = '';
  roleList: Array<{id: string, name: string}> = [
    { id: '1', name: 'Admin' },
    { id: '2', name: 'Sistem' },
    { id: '3', name: 'Doktor' },
    { id: '4', name: 'Raportör' },
    { id: '5', name: 'Firma' },
    { id: '6', name: 'Hastane' }
  ];
  companyList: Array<{id: string, name: string}> = [];

  constructor(
    private http: HttpService,
    private swal: SwalService,
    public fuseAlert: GlobalFuseAlertService,
    private fb: FormBuilder
  ) {    // Initialize stepper forms
    this.personalInfoForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9\s\+\-\(\)]+$/) // Phone number pattern
      ]],
      identityNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{11}$/) // TC Kimlik No pattern (11 rakam)
      ]],
      roleId: ['', [
        Validators.required
      ]]
    });    this.loginInfoForm = this.fb.group({
      password: ['', [
        // Password is only required for create mode, optional for update
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) // At least one lowercase, uppercase, and number
      ]],
      repassword: [''],
      isActive: [true] // Default to true (active)
    }, { validators: this.passwordMatchValidator });
  }

  // Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }  // Custom validator for password confirmation
  passwordMatchValidator(form: any) {
    const password = form.get('password');
    const repassword = form.get('repassword');

    if (password && repassword) {
      // If password has value, repassword must match
      if (password.value && password.value !== repassword.value) {
        repassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        if (repassword && repassword.hasError('passwordMismatch')) {
          repassword.setErrors(null);
        }
        return null;
      }
    }
    return null;
  }ngOnInit(): void {
    this.getAll();
    this.getCompanies();
  }

  getCompanies() {
    this.http.post<any>('api/Companies/GetAllCompany', {}, (res) => {
      if (res && res.data && Array.isArray(res.data)) {
        this.companyList = res.data.map((c: any) => ({ id: c.id, name: c.companySmallTitle || c.companyTitle }));
      } else {
        this.companyList = [];
      }
    }, (error) => {
      this.companyList = [];
    });
  }

  onStatusFilterChange() {
    this.pageIndex = 0;
    this.updatePagination();
  }
  onRoleFilterChange() {
    this.pageIndex = 0;
    this.updatePagination();
  }
  onCompanyFilterChange() {
    this.pageIndex = 0;
    this.updatePagination();
  }

  // Check if we're on the last step
  onStepChange(event: any) {
    this.isLastStep = event.selectedIndex === 1; // 1 is the second step (0-based)
  }  closeModal() {
    this.showCreateModal = false;
    this.showUpdateModal = false;
    this.clearModalAlert();
    this.resetAllForms();
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.isUpdateMode = false;
    this.selectedUser = null;
  }
  deleteById(model: UserListModel) {
    console.log('Delete user clicked:', model.firstName, model.lastName);
    
    this.swal.showWarning(
      "Kullanıcıyı Sil",
      `${model.firstName} ${model.lastName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      () => {
        this.swal.showLoading('Kullanıcı siliniyor...');
        
        const userId = model.id || model.userId;
        
        this.http.post<string>("api/Users/DeleteUserById", { id: userId }, (res) => {
          this.swal.hideLoading();
          this.getAll(); // This will call updatePagination()
          this.swal.showSuccess('Başarılı', 'Kullanıcı başarıyla silindi.');
        }, (error) => {
          this.swal.hideLoading();
          let errorMessage = 'Kullanıcı silinirken bir hata oluştu.';
          if (error?.error?.message) {
            errorMessage = error.error.message;
          }
          this.swal.showError('Hata', errorMessage);
        });
      }
    );
    
  }

  // Edit user - open modal with user data
  editUser(model: UserListModel) {
    
    this.selectedUser = model;
    this.isUpdateMode = true;
    this.showUpdateModal = true;
    this.clearModalAlert();
    
    this.resetAllForms();
    
    this.setPasswordValidation(false);     
    let roleId = 1;
    if (model.userRoles && model.userRoles.length > 0) {

      roleId = this.getRoleIdFromGuid(model.userRoles[0].roleId);

    }
    
    this.personalInfoForm.patchValue({
      firstName: model.firstName,
      lastName: model.lastName,
      email: model.email,
      phoneNumber: model.phone || model.phoneNumber,
      identityNumber: model.identityNumber,
      roleId: roleId
    });
    
    this.loginInfoForm.patchValue({
      password: '', // Don't populate password for security
      repassword: '',
      isActive: model.isActive
    });

    // Focus first input after modal opens
    setTimeout(() => {
      const firstInput = document.getElementById('updateFirstName');
      if (firstInput) {
        (firstInput as HTMLInputElement).focus();
      }
    }, 100);
  }  onOpenCreateModal() {
    this.showCreateModal = true;
    this.isUpdateMode = false;
    this.clearModalAlert();
    this.resetAllForms();
    
    // Set password validation for create mode (required)
    this.setPasswordValidation(true);
    
    this.showPassword = false;
    this.showConfirmPassword = false;


    setTimeout(() => {
      const firstInput = document.getElementById('firstName');
      if (firstInput) {
        (firstInput as HTMLInputElement).focus();
      }
    }, 100);
  }
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedUsers();
  }
  // Handle user code input - convert to uppercase automatically
  onUserCodeInput(event: any) {
    const inputValue = event.target.value;
    const upperCaseValue = inputValue.toUpperCase();

    // Update the form control value
    this.personalInfoForm.get('user_code')?.setValue(upperCaseValue, { emitEvent: false });

    // Update the input field display
    event.target.value = upperCaseValue;
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

  // Generate unique login ID
  private generateLoginId(): string {
    return '3fa85f64-5717-4562-b3fc-2c963f66afa6'; // Example GUID, you can generate a real one
  }  update() {
    // Use the same validation logic as the button
    if (this.isUpdateFormValid() && this.selectedUser) {
      this.clearModalAlert();
      this.loading = true;

      const selectedRoleId = parseInt(this.personalInfoForm.value.roleId);
      const isActiveValue = this.loginInfoForm.value.isActive;
      const updateData = {
        id: this.selectedUser.id || this.selectedUser.userId,
        loginId: this.selectedUser.loginId || this.generateLoginId(),
        roleId: this.getRoleGuid(selectedRoleId), // Convert to GUID
        firstName: this.personalInfoForm.value.firstName,
        lastName: this.personalInfoForm.value.lastName,
        phoneNumber: this.personalInfoForm.value.phoneNumber,
        email: this.personalInfoForm.value.email,
        isActive: isActiveValue !== null && isActiveValue !== undefined ? Boolean(isActiveValue) : true, // Ensure boolean value
        identityNumber: this.personalInfoForm.value.identityNumber,
        createdDate: this.selectedUser.createdAt || new Date().toISOString()
      };


      // Add password only if provided
      if (this.loginInfoForm.value.password && this.loginInfoForm.value.password.trim() !== '') {
        updateData['password'] = this.loginInfoForm.value.password;
        updateData['repassword'] = this.loginInfoForm.value.repassword;
      }      this.http.post<any>("api/Users/UpdateUser", updateData, (res) => {
        // Extract the message from the response data
        const message = res?.data || res || 'Kullanıcı başarıyla güncellendi';
        this.swal.callToast(message, "success");
        this.resetAllForms();
        this.closeModal();
        this.getAll(); // Refresh the list
        this.loading = false;}, (error) => {
        let errorMessage = 'Kullanıcı güncellenirken bir hata oluştu.';

        // Handle specific API errors - support new format with ErrorMessages array
        if (error?.error?.ErrorMessages && Array.isArray(error.error.ErrorMessages) && error.error.ErrorMessages.length > 0) {
          errorMessage = error.error.ErrorMessages.join(', ');
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        console.error('Update user error:', error);
        this.showModalAlertWithAutoDismiss('error', errorMessage, false); // Don't auto-dismiss errors
        this.loading = false;
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.personalInfoForm.markAllAsTouched();
      this.loginInfoForm.markAllAsTouched();
      this.showModalAlertWithAutoDismiss('error', 'Lütfen tüm gerekli alanları doğru şekilde doldurunuz.', false);
    }
  }

  // Check if update form is valid for submission
  isUpdateFormValid(): boolean {
    const personalFormValid = this.personalInfoForm.valid;
    const passwordValue = this.loginInfoForm.get('password')?.value;
    
    // If no password entered, only check personal form
    if (!passwordValue || passwordValue.trim() === '') {
      return personalFormValid;
    }
    
    // If password is entered, check both forms
    return personalFormValid && this.loginInfoForm.valid;
  }

  // Set password validation based on mode
  private setPasswordValidation(isRequired: boolean = true) {
    const passwordControl = this.loginInfoForm.get('password');
    const repasswordControl = this.loginInfoForm.get('repassword');

    if (isRequired) {
      // Create mode - password required
      passwordControl?.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]);
      repasswordControl?.setValidators([Validators.required]);
    } else {
      // Update mode - password optional
      passwordControl?.setValidators([
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]);
      repasswordControl?.setValidators([]);
    }

    passwordControl?.updateValueAndValidity();
    repasswordControl?.updateValueAndValidity();
  }

  // GUID <-> RoleId mapping fonksiyonları
  private getRoleGuid(roleId: number): string {
    const roleMapping = {
      1: '5ed62427-ec28-46ce-be0e-376005fae043', // Admin
      2: '46fecbbe-79b3-4a0c-85d2-a7846d901272', // System
      3: 'ba9c54b2-d78b-44e2-aa7e-33c85aab0497', // Doctor
      4: 'e5b650ef-c509-42bd-8e9f-f784cbb338ed', // Reporter
      5: '58d79190-fa0a-4a75-befb-a11b270b1b0e', // Company
      6: '47d90a18-da9e-4fe7-9199-7b73697f2001'  // Hospital
    };
    return roleMapping[roleId] || roleMapping[1];
  }
  private getRoleIdFromGuid(roleGuid: string): number {
    const roleMapping = {
      '5ed62427-ec28-46ce-be0e-376005fae043': 1, // Admin
      '46fecbbe-79b3-4a0c-85d2-a7846d901272': 2, // System
      'ba9c54b2-d78b-44e2-aa7e-33c85aab0497': 3, // Doctor
      'e5b650ef-c509-42bd-8e9f-f784cbb338ed': 4, // Reporter
      '58d79190-fa0a-4a75-befb-a11b270b1b0e': 5, // Company
      '47d90a18-da9e-4fe7-9199-7b73697f2001': 6  // Hospital
    };
    return roleMapping[roleGuid] || 1;
  }

  // Update pagination when search or data changes
  updatePagination() {
    // Filter users based on search
    this.filteredUsers = this.users.filter(user => {
      let matchesSearch = true;
      let matchesStatus = true;
      let matchesRole = true;
      let matchesCompany = true;
      if (this.search && this.search.trim() !== '') {
        const searchTerm = this.search.toLowerCase();
        matchesSearch = (
          (user.firstName && user.firstName.toLowerCase().includes(searchTerm)) ||
          (user.lastName && user.lastName.toLowerCase().includes(searchTerm)) ||
          (user.email && user.email.toLowerCase().includes(searchTerm)) ||
          (user.loginId && user.loginId.toLowerCase().includes(searchTerm)) ||
          (user.phone && user.phone.toLowerCase().includes(searchTerm)) ||
          (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchTerm)) ||
          (user.identityNumber && user.identityNumber.toLowerCase().includes(searchTerm)) ||
          (user.userCode && user.userCode.toLowerCase().includes(searchTerm)) ||
          (user.firstName && user.lastName && `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm)) ||
          (user.userRoles && user.userRoles.some(role => role.roleName && role.roleName.toLowerCase().includes(searchTerm)))
        );
      }
      if (this.statusFilter !== '') {
        matchesStatus = (this.statusFilter === 'true') ? user.isActive === true : user.isActive === false;
      }
      if (this.roleFilter !== '') {
        // roleFilter bir sayı (string), user.userRoles içindeki roleId ise GUID. Eşleştirme için roleFilter'ı GUID'e çevir.
        const selectedRoleGuid = this.getRoleGuid(Number(this.roleFilter));
        matchesRole = user.userRoles && user.userRoles.some(role => role.roleId && role.roleId.toString() === selectedRoleGuid);
      }
      if (this.companyFilter !== '') {
        // Sadece modelde tanımlı olan companyId ile filtreleme yap
        matchesCompany = user.companyId && user.companyId.toString() === this.companyFilter;
      }
      return matchesSearch && matchesStatus && matchesRole && matchesCompany;
    });

    // Check if current page index is valid after filtering
    const maxPageIndex = Math.max(0, Math.ceil(this.filteredUsers.length / this.pageSize) - 1);
    if (this.pageIndex > maxPageIndex) {
      this.pageIndex = 0; // Reset to first page if current page is out of bounds
    }

    // Calculate paginated users
    this.updatePaginatedUsers();
  }

  // Update paginated users based on current page
  updatePaginatedUsers() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }
  // Called when search input changes
  onSearchChange() {
    this.pageIndex = 0; // Always reset to first page when searching
    this.updatePagination();
  }
   getAll() {
    // Try multiple possible API endpoints and handle various response formats
    this.http.post<UserListModel[]>("api/Users/GetAllUser", {}, (res) => {
      console.log("GetAll Users Response:", res);
      if (Array.isArray(res)) {
        this.users = res;
      } else {
        console.warn("API response is not an array:", res);
        // If response is not an array, use empty array
        this.users = [];
      }
      this.updatePagination();
    }, (error) => {
      console.error("Error fetching users:", error);
      console.log("Trying alternate endpoint...");
    });
  }

  create() {
    // Combine all stepper form values
    const allFormsValid = this.personalInfoForm.valid &&
      this.loginInfoForm.valid;    
      if (allFormsValid) {
      this.clearModalAlert();
      this.loading = true;      // Create data in the exact order the API expects
      const selectedRoleId = parseInt(this.personalInfoForm.value.roleId);
      const isActiveValue = this.loginInfoForm.value.isActive;
      const requestData = {
        firstName: this.personalInfoForm.value.firstName,
        lastName: this.personalInfoForm.value.lastName,
        email: this.personalInfoForm.value.email,
        phoneNumber: this.personalInfoForm.value.phoneNumber,
        password: this.loginInfoForm.value.password,
        repassword: this.loginInfoForm.value.repassword,
        identityNumber: this.personalInfoForm.value.identityNumber,
        roleId: this.getRoleGuid(selectedRoleId), // Convert to GUID
        loginId: this.generateLoginId(),
        isActive: isActiveValue !== null && isActiveValue !== undefined ? Boolean(isActiveValue) : true // Ensure boolean value
      };

      // Debug: Log the request data to verify isActive value
      console.log('Create user request data:', requestData);
      console.log('isActive value:', isActiveValue, 'type:', typeof isActiveValue, 'final value:', requestData.isActive);      // Send the complete data including repassword as API expects it
      this.http.post<any>("api/Users/Create", requestData, (res) => {
        // Extract the message from the response data
        const message = res?.data || res || 'Kullanıcı başarıyla oluşturuldu';
        this.swal.callToast(message, "success");
        this.resetAllForms();
        this.closeModal();
        this.getAll(); // This will call updatePagination()
        this.loading = false;}, (error) => {
        let errorMessage = 'Kullanıcı oluşturulurken bir hata oluştu.';

        // Handle specific API errors - support new format with ErrorMessages array
        if (error?.error?.ErrorMessages && Array.isArray(error.error.ErrorMessages) && error.error.ErrorMessages.length > 0) {
          errorMessage = error.error.ErrorMessages.join(', ');
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        console.error('Create user error:', error);
        this.showModalAlertWithAutoDismiss('error', errorMessage, false); // Don't auto-dismiss errors
        this.loading = false;
      });
    } else {      // Mark all fields as touched to show validation errors
      this.personalInfoForm.markAllAsTouched();
      this.loginInfoForm.markAllAsTouched();
      this.showModalAlertWithAutoDismiss('error', 'Lütfen tüm gerekli alanları doğru şekilde doldurunuz.', false);
    }
  }  // Reset all stepper forms
  resetAllForms() {
    this.personalInfoForm.reset();
    this.loginInfoForm.reset();

    // Set default values after reset
    this.loginInfoForm.patchValue({
      isActive: true // Ensure isActive defaults to true after reset
    });

    this.personalInfoForm.markAsUntouched();
    this.loginInfoForm.markAsUntouched();

    this.isLastStep = false;
  }
}
