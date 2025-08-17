import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplatesService, TemplateModel } from './templates.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-templates',
  template: `
    <div class="min-h-screen w-screen max-w-none p-0 m-0 flex flex-col bg-gray-50">
      <div class="flex-1 flex flex-col justify-start items-stretch w-full">
        <div class="w-full max-w-none px-0 py-0">
          <h2 class="text-xl font-bold mb-8 mt-8 pl-8">Şablonlar</h2>

          <div class="flex justify-start mb-4 items-center gap-4">
            <button *ngIf="!showForm" (click)="openAddForm()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-8">Şablon Ekle</button>
            <input type="text" [(ngModel)]="searchText" (input)="onSearchTemplates()" placeholder="Şablonlarda ara..." class="border rounded px-3 py-2 ml-2 w-64" style="max-width: 240px;" />
          </div>

          <!-- Modal (Ekleme ve Güncelleme için, klasik modal overlay ve ortalanmış kutu) -->
          <div *ngIf="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div class="bg-white max-w-2xl w-full rounded shadow p-8 relative">
              <button (click)="cancelForm()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl">&times;</button>
              <form [formGroup]="templateForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <h3 class="text-lg font-bold mb-4">{{ editMode ? 'Şablon Düzenle' : 'Şablon Ekle' }}</h3>
                <div>
                  <label class="block font-medium mb-1">Şablon Adı</label>
                  <input formControlName="name" class="w-full border rounded px-3 py-2" placeholder="Şablon adı" />
                  <div *ngIf="templateForm.get('name')?.touched && templateForm.get('name')?.invalid" class="text-red-600 text-xs mt-1">Şablon adı zorunludur.</div>
                </div>
                <div>
                  <label class="block font-medium mb-1">Rapor Tipi</label>
                  <input formControlName="raporTipi" class="w-full border rounded px-3 py-2" placeholder="Rapor tipi" />
                  <div *ngIf="templateForm.get('raporTipi')?.touched && templateForm.get('raporTipi')?.invalid" class="text-red-600 text-xs mt-1">Rapor tipi zorunludur.</div>
                </div>
                <div>
                  <label class="block font-medium mb-1">Context HTML</label>
                  <quill-editor formControlName="contextHtml" class="w-full border rounded" [style]="{minHeight: '120px'}"></quill-editor>
                  <div *ngIf="templateForm.get('contextHtml')?.touched && templateForm.get('contextHtml')?.invalid" class="text-red-600 text-xs mt-1">HTML içeriği zorunludur.</div>
                </div>
                <div>
                  <label class="block font-medium mb-1">Context (Açıklama)</label>
                  <textarea formControlName="context" class="w-full border rounded px-3 py-2" rows="2" placeholder="Açıklama"></textarea>
                  <div *ngIf="templateForm.get('context')?.touched && templateForm.get('context')?.invalid" class="text-red-600 text-xs mt-1">Açıklama zorunludur.</div>
                </div>
                <div class="flex justify-end space-x-2">
                  <button type="submit" [disabled]="templateForm.invalid" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{{ editMode ? 'Güncelle' : 'Ekle' }}</button>
                  <button type="button" (click)="cancelForm()" class="px-4 py-2 rounded border">Vazgeç</button>
                </div>
              </form>
            </div>
          </div>

          <div *ngIf="successMessage" class="mt-4 p-3 bg-green-100 text-green-800 rounded border border-green-200 w-full">{{ successMessage }}</div>
          <div class="mt-8 w-full flex-1 flex flex-col justify-stretch items-stretch">
            <div class="overflow-x-auto w-full h-full flex-1" style="overflow-y: visible !important; min-height: 60vh;">
              <table class="min-w-full w-full h-full text-sm bg-white table-fixed">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="px-2 py-1">Adı</th>
                    <th class="px-2 py-1">Rapor Tipi</th>
                    <th class="px-2 py-1">HTML</th>
                    <th class="px-2 py-1">Açıklama</th>
                    <th class="px-2 py-1 text-center" style="width: 60px;">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let t of paginatedTemplates">
                    <td class="px-2 py-1 font-bold">{{ t.name }}</td>
                    <td class="px-2 py-1">{{ t.raporTipi }}</td>
                    <td class="px-2 py-1"><span [innerHTML]="t.contextHtml"></span></td>
                    <td class="px-2 py-1">{{ t.content || '-' }}</td>
                    <td class="px-2 py-1 text-center align-middle relative" style="vertical-align: middle;">
                      <div class="flex items-center justify-center w-full h-full" style="min-height: 32px;">
                        <button (click)="t.menuOpen = !t.menuOpen" class="flex flex-col items-center justify-center px-2 py-1 bg-gray-200 text-xs rounded mx-auto block" style="line-height: 0.7; font-size: 22px; margin-top: 0; position: relative; z-index: 10;">
                          <span style="display: block;">•</span>
                          <span style="display: block;">•</span>
                          <span style="display: block;">•</span>
                        </button>
                        <div *ngIf="t.menuOpen" class="origin-top absolute left-1/2 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-30" style="transform: translateX(-50%); top: 100%; border: none; box-shadow: 0 4px 16px 0 rgba(0,0,0,0.10);">
                          <div class="py-1">
                            <button (click)="editTemplate(t); t.menuOpen=false" class="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100">
                              <span class="inline-block align-middle mr-2">✏️</span> Düzenle
                            </button>
                            <button (click)="deleteTemplate(t); t.menuOpen=false" class="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100 text-red-600">
                              <span class="inline-block align-middle mr-2">🗑️</span> Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="!paginatedTemplates.length">
                    <td colspan="5" class="text-center text-gray-400 py-2">Henüz şablon eklenmedi.</td>
                  </tr>
                </tbody>
              </table>
              <!-- MatPaginator tam tablo altına, sayfa genişliğine tam oturacak şekilde -->
              <div class="w-full mt-2">
                <mat-paginator
                  [length]="templates.length"
                  [pageSize]="pageSize"
                  [pageSizeOptions]="pageSizeOptions"
                  (page)="onPageChange($event)"
                  [pageIndex]="currentPage"
                  aria-label="Şablonlar Paginator"
                  style="width: 100%;">
                </mat-paginator>
              </div>
            </div>
          </div>
          <!-- <button *ngIf="!editMode" type="button" (click)="showTemplates = false" class="ml-2 px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50">Şablon Ekle</button> -->
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class TemplatesComponent implements OnInit {
  templateForm: FormGroup;
  templates: TemplateModel[] = [];
  successMessage = '';
  editMode = false;
  editingId: string | null = null;
  showTemplates = true;
  showForm = false;
  paginatedTemplates: TemplateModel[] = [];

  // Paginator ile ilgili değişkenler
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Arama ile ilgili değişkenler
  searchText: string = '';

  constructor(private fb: FormBuilder, private templatesService: TemplatesService) {
    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      raporTipi: ['', Validators.required],
      contextHtml: ['', Validators.required],
      context: ['', Validators.required],
    });
    // Tüm alanları touched yaparak validasyonları ilk yüklemede göster
    Promise.resolve().then(() => {
      Object.values(this.templateForm.controls).forEach(control => control.markAsTouched());
    });
  }

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.templatesService.getAll().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.templates = data;
        } else if (data && Array.isArray(data.value)) {
          this.templates = data.value;
        } else if (data && Array.isArray(data.data)) {
          this.templates = data.data;
        } else {
          this.templates = [];
        }
        // Sayfa değiştiğinde veya boyutu değiştiğinde görüntülenecek şablonları ayarla
        this.updatePaginatedTemplates();
      },
      error: (err) => {
        console.error('Şablonlar getAll API hatası:', err);
        this.templates = [];
      }
    });
  }

  // Mevcut sayfa ve boyutuna göre görüntülenecek şablonları güncelle
  updatePaginatedTemplates() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTemplates = this.templates.slice(startIndex, endIndex);
  }

  openAddForm() {
    this.editMode = false;
    this.editingId = null;
    this.templateForm.reset();
    Object.values(this.templateForm.controls).forEach(control => control.markAsTouched());
    this.showForm = true;
  }

  openEditModal(t: TemplateModel) {
    this.editMode = true;
    this.editingId = t.id || null;
    this.templateForm.patchValue({
      name: t.name,
      raporTipi: t.raporTipi,
      contextHtml: t.contextHtml,
      context: t.context
    });
    Object.values(this.templateForm.controls).forEach(control => control.markAsTouched());
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.templateForm.reset();
    this.editMode = false;
    this.editingId = null;
  }

  onSubmit() {
    if (this.templateForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Eksik Bilgi',
        text: 'Lütfen tüm zorunlu alanları doldurun.',
        confirmButtonText: 'Tamam',
        position: 'top',
        toast: true
      });
      return;
    }
    const formValue = this.templateForm.value;
    if (this.editMode && this.editingId) {
      // Güncelleme için sadece istenen alanları içeren payload
      const contextValue = (formValue.context );
      if (!contextValue) {
        Swal.fire({
          icon: 'error',
          title: 'Eksik Bilgi',
          text: 'Açıklama alanı zorunludur.',
          confirmButtonText: 'Tamam',
          position: 'top',
          toast: true
        });
        return;
      }
      const updatePayload = {
        id: this.editingId,
        name: formValue.name,
        raporTipi: formValue.raporTipi,
        contextHtml: formValue.contextHtml,
        content: contextValue
      };
      this.templatesService.update(updatePayload).subscribe({
        next: () => {
          this.successMessage = 'Şablon güncellendi!';
          this.loadTemplates();
          this.cancelForm();
          this.showTemplates = true;
          setTimeout(() => this.successMessage = '', 2000);
          Swal.fire({
            icon: 'success',
            title: 'Şablon başarıyla güncellendi',
            timer: 1800,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
          });
        },
        error: (err) => {
          console.error('Şablon güncelleme API hatası:', err);
          if (err && err.error && err.error.errors) {
            console.error('API validation errors:', err.error.errors); // Tüm validation hatalarını göster
          }
          if (err && err.error && err.error.errors && err.error.errors.Context) {
            Swal.fire({
              icon: 'error',
              title: 'Hata',
              text: err.error.errors.Context[0],
              confirmButtonText: 'Tamam',
              position: 'top',
              toast: true
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Hata',
              text: 'Şablon güncellenirken bir hata oluştu.',
              confirmButtonText: 'Tamam',
              position: 'top',
              toast: true
            });
          }
        }
      });
    } else {
      const contextValue = (formValue.context || '').trim();
      if (!contextValue) {
        Swal.fire({
          icon: 'error',
          title: 'Eksik Bilgi',
          text: 'Açıklama alanı zorunludur.',
          confirmButtonText: 'Tamam',
          position: 'top',
          toast: true
        });
        return;
      }
      const createPayload = {
        name: formValue.name,
        raporTipi: formValue.raporTipi,
        contextHtml: formValue.contextHtml,
        content: contextValue,
        context: contextValue
      };
      this.templatesService.create(createPayload).subscribe({
        next: () => {
          this.successMessage = 'Şablon başarıyla eklendi!';
          this.loadTemplates();
          this.cancelForm();
          this.showTemplates = true;
          setTimeout(() => this.successMessage = '', 2000);
          Swal.fire({
            icon: 'success',
            title: 'Şablon başarıyla eklendi',
            timer: 1800,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
          });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Şablon eklenirken bir hata oluştu.',
            confirmButtonText: 'Tamam',
            position: 'top',
            toast: true
          });
        }
      });
    }
  }

  editTemplate(t: TemplateModel) {
    this.openEditModal(t);
  }

  cancelEdit() {
    this.editMode = false;
    this.editingId = null;
    this.templateForm.reset();
    Object.values(this.templateForm.controls).forEach(control => control.markAsTouched());
  }

  deleteTemplate(t: TemplateModel) {
    Swal.fire({
      title: 'Şablon Sil',
      text: 'Bu şablonu silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'Vazgeç',
      position: 'top'
    }).then((result) => {
      if (result.isConfirmed && t.id) {
        this.templatesService.delete(t.id).subscribe({
          next: () => {
            this.successMessage = 'Şablon silindi!';
            this.loadTemplates();
            setTimeout(() => this.successMessage = '', 2000);
            Swal.fire({
              icon: 'success',
              title: 'Şablon başarıyla silindi',
              timer: 1800,
              showConfirmButton: false,
              position: 'top-end',
              toast: true
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Hata',
              text: 'Şablon silinirken bir hata oluştu.',
              confirmButtonText: 'Tamam',
              position: 'top',
              toast: true
            });
          }
        });
      }
    });
  }

  // Sayfa değiştiğinde çağrılan metod
  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.onSearchTemplates();
  }

  // Şablonlarda arama yapmak için kullanılan metod
  onSearchTemplates() {
    const search = (this.searchText || '').toLowerCase().trim();
    if (!search) {
      this.paginatedTemplates = this.templates.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
      return;
    }
    const filtered = this.templates.filter(t =>
      (t.name && t.name.toLowerCase().includes(search)) ||
      (t.raporTipi && t.raporTipi.toLowerCase().includes(search)) ||
      (t.content && t.content.toLowerCase().includes(search))
    );
    this.paginatedTemplates = filtered.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
  }
}
