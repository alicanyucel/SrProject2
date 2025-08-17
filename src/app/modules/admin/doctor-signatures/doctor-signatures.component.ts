import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { DoctorSignatureListModel, CreateDoctorSignatureRequest, UpdateDoctorSignatureRequest } from '../../../models/doctor-signature.model';
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
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoPaginatorIntl } from '../../../services/transloco-paginator-intl.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslocoService } from '@ngneat/transloco';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-doctor-signatures',
  standalone: true,
  imports: [
    SharedModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, ReactiveFormsModule, MatStepperModule, MatCheckboxModule, MatMenuModule, TranslocoModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: TranslocoPaginatorIntl }
  ],
  templateUrl: './doctor-signatures.component.html',  styles: [`
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
    /* Doctor Signature Actions Menu Styles */
    :host ::ng-deep .doctor-signature-actions-menu .mat-mdc-menu-panel {
      min-width: 160px !important;
      max-width: 200px !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    }
    
    :host ::ng-deep .doctor-signature-actions-menu .mat-mdc-menu-item {
      height: 44px !important;
      padding: 0 16px !important;
      font-size: 14px !important;
      transition: all 0.2s ease !important;
    }
    
    :host ::ng-deep .doctor-signature-actions-menu .mat-mdc-menu-item:hover {
      background-color: #f8fafc !important;
    }
    
    :host ::ng-deep .doctor-signature-actions-menu .mat-mdc-menu-item .mat-icon {
      margin-right: 12px !important;
    }/* Canvas Styles */
    .signature-canvas {
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      cursor: crosshair;
      background-color: #ffffff;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }

    .signature-canvas:hover {
      border-color: #3b82f6;
    }

    .signature-canvas:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }

    .signature-container {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 1rem;
    }
  `],
  animations: [shake, fuseAnimations]
})
export class DoctorSignaturesComponent implements AfterViewInit {
  @ViewChild('signatureCanvas', { static: false }) canvasElementRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('updateSignatureCanvas', { static: false }) updateCanvasElementRef!: ElementRef<HTMLCanvasElement>;

  doctorSignatures: DoctorSignatureListModel[] = [];
  filteredDoctorSignatures: DoctorSignatureListModel[] = [];
  paginatedDoctorSignatures: DoctorSignatureListModel[] = [];
  search: string = "";

  // Stepper form groups
  signatureInfoForm: FormGroup;
  signatureCanvasForm: FormGroup;

  // Modal states
  showCreateModal = false;
  showUpdateModal = false;
  showModalAlert = false;
  modalAlert: { id: string; type: string; message: string; timestamp: number } | null = null;
  
  // Update mode
  isUpdateMode = false;
  selectedDoctorSignature: DoctorSignatureListModel | null = null;

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  
  // Form validation
  loading = false;

  // Stepper control
  isLastStep = false;

  // Canvas control
  private isDrawing = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private signatureDataUrl: string = '';

  constructor(
    private http: HttpService,
    private swal: SwalService,
    public fuseAlert: GlobalFuseAlertService,
    private fb: FormBuilder,
    private translocoService: TranslocoService
  ) {
    // Initialize stepper forms
    this.signatureInfoForm = this.fb.group({
      degree: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      degreeNo: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50)
      ]],
      diplomaNo: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50)
      ]],
      registerNo: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50)
      ]],
      displayName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]]
    });    this.signatureCanvasForm = this.fb.group({
      signature: ['', [Validators.required]]
    });

    this.getAll();
  }

  ngOnInit(): void {
    this.updatePaginatedDoctorSignatures();
  }

  ngAfterViewInit(): void {
    // Canvas will be initialized when modal opens
  }
  // Initialize canvas for drawing
  initializeCanvas(canvasElement: HTMLCanvasElement): void {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    
    if (this.ctx) {
      // Remove any existing event listeners
      this.removeCanvasEventListeners();
      
      // Set canvas size - Set physical size
      this.canvas.width = 400;
      this.canvas.height = 200;
      
      // Get device pixel ratio for high DPI support
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      
      // Scale canvas for high DPI displays
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      
      // Reset canvas back to expected size
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      
      // Set drawing properties
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.imageSmoothingEnabled = true;
      
      // Clear canvas with white background
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Add event listeners
      this.canvas.addEventListener('mousedown', this.startDrawing.bind(this), { passive: false });
      this.canvas.addEventListener('mousemove', this.draw.bind(this), { passive: false });
      this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this), { passive: false });
      this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this), { passive: false });
      
      // Touch events for mobile
      this.canvas.addEventListener('touchstart', this.handleTouch.bind(this), { passive: false });
      this.canvas.addEventListener('touchmove', this.handleTouch.bind(this), { passive: false });
      this.canvas.addEventListener('touchend', this.handleTouch.bind(this), { passive: false });
    }
  }

  // Remove canvas event listeners to prevent memory leaks
  private removeCanvasEventListeners(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('mousedown', this.startDrawing.bind(this));
      this.canvas.removeEventListener('mousemove', this.draw.bind(this));
      this.canvas.removeEventListener('mouseup', this.stopDrawing.bind(this));
      this.canvas.removeEventListener('mouseout', this.stopDrawing.bind(this));
      this.canvas.removeEventListener('touchstart', this.handleTouch.bind(this));
      this.canvas.removeEventListener('touchmove', this.handleTouch.bind(this));
      this.canvas.removeEventListener('touchend', this.handleTouch.bind(this));
    }
  }  private startDrawing(e: MouseEvent): void {
    this.isDrawing = true;
    const rect = this.canvas!.getBoundingClientRect();
    
    // Koordinatları düzgün hesapla
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.ctx!.beginPath();
    this.ctx!.moveTo(x, y);
  }

  private draw(e: MouseEvent): void {
    if (!this.isDrawing) return;
    
    const rect = this.canvas!.getBoundingClientRect();
    
    // Koordinatları düzgün hesapla
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.ctx!.lineTo(x, y);
    this.ctx!.stroke();
  }

  private stopDrawing(): void {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveSignature();
    }
  }
  private handleTouch(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.touches[0] || e.changedTouches[0];
    
    let eventType: string;
    switch(e.type) {
      case 'touchstart': eventType = 'mousedown'; break;
      case 'touchmove': eventType = 'mousemove'; break;
      case 'touchend': eventType = 'mouseup'; break;
      default: eventType = 'mouseup';
    }
    
    const mouseEvent = new MouseEvent(eventType, {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.canvas!.dispatchEvent(mouseEvent);
  }
  private saveSignature(): void {
    if (this.canvas) {
      this.signatureDataUrl = this.canvas.toDataURL('image/png');
      // Remove the base64 prefix before saving
      const base64Data = this.signatureDataUrl.replace(/^data:image\/png;base64,/, '');
      this.signatureCanvasForm.patchValue({
        signature: base64Data
      });
    }
  }
  clearSignature(): void {
    if (this.ctx && this.canvas) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.signatureDataUrl = '';
      this.signatureCanvasForm.patchValue({
        signature: ''
      });
    }
  }
  getAll(): void {
    this.http.post<any>("api/Signatures/GetAllDoctorSignature", {}, (response) => {
      console.log("GetAll Doctor Signatures Response:", response);
      let doctorSignatures = [];
      if (response && response.data && Array.isArray(response.data)) {
        // API returns {data: [], errorMessages: null, isSuccessful: true}
        doctorSignatures = response.data.filter(sig => !sig.isDeleted);
      } else if (Array.isArray(response)) {
        doctorSignatures = response.filter(sig => !sig.isDeleted);
      } else {
        console.warn("API response format not recognized:", response);
        doctorSignatures = [];
      }
      this.doctorSignatures = doctorSignatures;
      this.filteredDoctorSignatures = [...this.doctorSignatures];
      this.updatePaginatedDoctorSignatures();
    }, (error) => {
      console.error('Error fetching doctor signatures:', error);
      this.doctorSignatures = [];
      this.filteredDoctorSignatures = [];
      this.updatePaginatedDoctorSignatures();
      this.fuseAlert.showAlert('error', 'Doktor imzaları yüklenirken bir hata oluştu.');
    });
  }

  onSearchChange(): void {
    if (!this.search || this.search.trim() === '') {
      this.filteredDoctorSignatures = [...this.doctorSignatures];
    } else {
      const searchTerm = this.search.toLowerCase().trim();
      this.filteredDoctorSignatures = this.doctorSignatures.filter(signature =>
        signature.degree.toLowerCase().includes(searchTerm) ||
        signature.degreeNo.toLowerCase().includes(searchTerm) ||
        signature.diplomaNo.toLowerCase().includes(searchTerm) ||
        signature.registerNo.toLowerCase().includes(searchTerm) ||
        signature.displayName.toLowerCase().includes(searchTerm)
      );
    }
    
    this.pageIndex = 0;
    this.updatePaginatedDoctorSignatures();
  }

  updatePaginatedDoctorSignatures(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedDoctorSignatures = this.filteredDoctorSignatures.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedDoctorSignatures();
  }
  // Reset all stepper forms
  resetAllForms() {
    this.signatureInfoForm.reset();
    this.signatureCanvasForm.reset();

    this.signatureInfoForm.markAsUntouched();
    this.signatureCanvasForm.markAsUntouched();

    this.isLastStep = false;
    this.signatureDataUrl = '';
  }

  // Check if we're on the last step
  onStepChange(event: any) {
    this.isLastStep = event.selectedIndex === 1; // 1 is the second step (0-based)
    
    // Initialize canvas when reaching signature step
    if (event.selectedIndex === 1) {
      setTimeout(() => {
        if (this.showCreateModal && this.canvasElementRef) {
          this.initializeCanvas(this.canvasElementRef.nativeElement);
        } else if (this.showUpdateModal && this.updateCanvasElementRef) {
          this.initializeCanvas(this.updateCanvasElementRef.nativeElement);
        }
      }, 100);
    }
  }
  closeModal() {
    this.showCreateModal = false;
    this.showUpdateModal = false;
    this.clearModalAlert();
    this.resetAllForms();
    this.isUpdateMode = false;
    this.selectedDoctorSignature = null;
    
    // Canvas event listeners'ı temizle
    this.removeCanvasEventListeners();
    this.canvas = null;
    this.ctx = null;
  }

  deleteById(model: DoctorSignatureListModel) {
        const idToDelete = String(model.id);
        const lang = this.translocoService.getActiveLang();
        const title = lang === 'tr' ? 'İmzayı Sil' : 'Delete Signature';
        const confirmMsg = lang === 'tr'
          ? `${model.displayName} doktor imzasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
          : `Are you sure you want to delete the signature for Dr. ${model.displayName}? This action cannot be undone.`;
        const loadingMsg = lang === 'tr' ? 'İmza siliniyor...' : 'Deleting signature...';
        const errorTitle = lang === 'tr' ? 'Hata' : 'Error';
        const successTitle = lang === 'tr' ? 'Başarılı' : 'Success';
        const successMsg = lang === 'tr' ? 'Doktor imzası başarıyla silindi.' : 'Doctor signature deleted successfully.';
        const failMsg = lang === 'tr' ? 'Silme işlemi başarısız.' : 'Delete operation failed.';
        const defaultError = lang === 'tr' ? 'Doktor imzası silinirken bir hata oluştu.' : 'An error occurred while deleting the doctor signature.';
        // ...existing code...
        this.swal.showWarning(
            title,
            confirmMsg,
            () => {
                this.swal.showLoading(loadingMsg);
                this.http.post<any>("api/Signatures/DeleteDoctorSignatureById", { signatureId: idToDelete }, (res) => {
                    this.swal.hideLoading();
                    if (res && (res.isSuccessful === false || res.success === false)) {
                        const backendMsg = res.errorMessages ? res.errorMessages.join('\n') : (res.message || failMsg);
                        this.swal.showError(errorTitle, backendMsg);
                        return;
                    }
                    this.getAll();
                    this.pageIndex = 0;
                    this.filteredDoctorSignatures = [...this.doctorSignatures];
                    this.updatePaginatedDoctorSignatures();
                    this.swal.showSuccess(successTitle, successMsg);
                    this.closeModal();
                }, (error) => {
                    this.swal.hideLoading();
                    let errorMessage = defaultError;
                    if (error?.error?.errorMessages && Array.isArray(error.error.errorMessages)) {
                        errorMessage = error.error.errorMessages.join('\n');
                    } else if (error?.error?.message) {
                        errorMessage = error.error.message;
                    }
                    this.swal.showError(errorTitle, errorMessage);
                });
            }
        );
    }

  // Edit doctor signature - open modal with signature data
  editDoctorSignature(model: DoctorSignatureListModel) {
    this.selectedDoctorSignature = model;
    this.isUpdateMode = true;
    this.showUpdateModal = true;
    this.clearModalAlert();
    
    this.resetAllForms();
    
    this.signatureInfoForm.patchValue({
      degree: model.degree,
      degreeNo: model.degreeNo,
      diplomaNo: model.diplomaNo,
      registerNo: model.registerNo,
      displayName: model.displayName
    });    this.signatureCanvasForm.patchValue({
      signature: model.signatureImage ? model.signatureImage.replace(/^data:image\/png;base64,/, '') : ''
    });

    this.signatureDataUrl = model.signatureImage;

    // Focus first input after modal opens
    setTimeout(() => {
      const firstInput = document.getElementById('updateDegree');
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
      const firstInput = document.getElementById('degree');
      if (firstInput) {
        (firstInput as HTMLInputElement).focus();
      }
    }, 100);
  }

  create(): void {
    if (this.signatureInfoForm.invalid || this.signatureCanvasForm.invalid) {
      const lang = this.translocoService.getActiveLang();
      const msg = lang === 'tr' ? 'Lütfen tüm zorunlu alanları doğru şekilde doldurunuz ve imza çiziniz.' : 'Please fill all required fields correctly and draw the signature.';
      this.showModalAlertWithAutoDismiss('error', msg);
      return;
    }

    this.loading = true;
    this.clearModalAlert();

    const signatureData: CreateDoctorSignatureRequest = {
      ...this.signatureInfoForm.value,
      ...this.signatureCanvasForm.value
    };    this.http.post<any>(
      "api/Signatures/CreateDoctorSignature",
      signatureData,
      (response) => {
        this.loading = false;
        this.getAll();
        this.closeModal();
        const lang = this.translocoService.getActiveLang();
        const message = lang === 'tr' ? 'Doktor imzası başarıyla eklendi' : 'Doctor signature added successfully';
        this.swal.callToast(message, "success");
      },
      (error) => {
        this.loading = false;
        const lang = this.translocoService.getActiveLang();
        let errorMessage = lang === 'tr'
          ? 'Doktor imzası eklenirken bir hata oluştu.'
          : 'An error occurred while adding the doctor signature.';
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.error?.errorMessages && Array.isArray(error.error.errorMessages)) {
          errorMessage = error.error.errorMessages.join('\n');
        }
        this.swal.showError(lang === 'tr' ? 'Hata' : 'Error', errorMessage + '\n' + JSON.stringify(error));
      }
    );
  }

  update(): void {
    if (this.signatureInfoForm.invalid || this.signatureCanvasForm.invalid) {
      const lang = this.translocoService.getActiveLang();
      const msg = lang === 'tr' ? 'Lütfen tüm zorunlu alanları doğru şekilde doldurunuz ve imza çiziniz.' : 'Please fill all required fields correctly and draw the signature.';
      this.showModalAlertWithAutoDismiss('error', msg);
      return;
    }

    this.loading = true;
    this.clearModalAlert();

    const signatureData: UpdateDoctorSignatureRequest = {
      id: this.selectedDoctorSignature!.id,
      ...this.signatureInfoForm.value,
      ...this.signatureCanvasForm.value
    };    this.http.post<any>("api/Signatures/UpdateDoctorSignature", signatureData, (response) => {
      this.loading = false;
      this.getAll();
      this.closeModal();
      const lang = this.translocoService.getActiveLang();
      const message = lang === 'tr' ? 'Doktor imzası başarıyla güncellendi' : 'Doctor signature updated successfully';
      this.swal.callToast(message, "success");
    },
    (error) => {
      this.loading = false;
      const lang = this.translocoService.getActiveLang();
      let errorMessage = lang === 'tr'
        ? 'Doktor imzası güncellenirken bir hata oluştu.'
        : 'An error occurred while updating the doctor signature.';
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.error?.errorMessages && Array.isArray(error.error.errorMessages)) {
        errorMessage = error.error.errorMessages.join('\n');
      }
      this.swal.showError(lang === 'tr' ? 'Hata' : 'Error', errorMessage + '\n' + JSON.stringify(error));
    });
  }

  clearModalAlert() {
    this.modalAlert = null;
    this.showModalAlert = false;
  }

  showModalAlertWithAutoDismiss(type: string, message: string, duration: number = 3000) {
    this.modalAlert = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now()
    };
    this.showModalAlert = true;
    setTimeout(() => {
      this.clearModalAlert();
    }, duration);
  }
}
