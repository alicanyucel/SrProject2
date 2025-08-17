import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ExamplePipe } from '../../../pipes/example.pipe';
import { ExampleModel } from '../../../models/example.model';
import { HttpService } from '../../../services/http.service';
import { SwalService } from '../../../services/swal.service';
import { NgForm } from '@angular/forms';
import { GlobalFuseAlertService } from '../../../services/fuse-alert.service';
import { shake } from '@fuse/animations/shake';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-examples',
  standalone: true,
  imports: [SharedModule, ExamplePipe, MatPaginatorModule],
  templateUrl: './example.component.html',
  animations: [shake, fuseAnimations]
})
export class ExamplesComponent {
  examples: ExampleModel[] = [
    { id: '1', field1: 'Örnek Alan 1', field2: 'Örnek Alan 2' }
  ];
  search:string = "";

  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel:ExampleModel = new ExampleModel();
  updateModel:ExampleModel = new ExampleModel();

  showCreateModal = false;
  showModalAlert = false;
  modalAlert: { type: string; message: string } | null = null;

  pageSize = 10;
  pageIndex = 0;

  alert: { type: string; message: string } = { type: 'info', message: '' };
  showAlert: boolean = false;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    public fuseAlert: GlobalFuseAlertService
  ){}

  ngOnInit(): void {
    this.getAll();
  }

  getAll(){
    this.http.post<ExampleModel[]>("Examples/GetAll",{},(res)=> {
      this.examples = res;
    });
  }

  create(form: NgForm){
    if(form.valid){
      // Her tıklamada önce alert'ı sıfırla ki hata tekrar gösterilebilsin
      this.showModalAlert = false;
      this.modalAlert = null;
      this.http.post<string>("Examples/Create",this.createModel,(res)=> {
        this.swal.callToast(res);
        this.createModel = new ExampleModel();
        this.createModalCloseBtn?.nativeElement.click();
        this.getAll();
      }, () => {
        this.modalAlert = { type: 'error', message: 'API bulunamadı veya sunucu hatası!' };
        this.showModalAlert = true;
      });
    }
  }

  // Modal kapatıldığında alert'ı da sıfırla
  closeModal() {
    this.showCreateModal = false;
    this.showModalAlert = false;
    this.modalAlert = null;
  }

  deleteById(model: ExampleModel){
    this.swal.callSwal("Veriyi Sil?",`${model.field1} verisini silmek istiyor musunuz?`,()=> {
      this.http.post<string>("Examples/DeleteById",{id: model.id},(res)=> {
        this.getAll();
        this.swal.callToast(res,"info");
      });
    })
  }

  get(model: ExampleModel){
    this.updateModel = {...model};
  }

  update(form: NgForm){
    if(form.valid){
      this.http.post<string>("Examples/Update",this.updateModel,(res)=> {
        this.swal.callToast(res,"info");
        this.updateModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }

  // Modal açıldığında form ve validasyon state'lerini sıfırla, ilk inputa odaklan
  onOpenCreateModal() {
    this.showCreateModal = true;
    this.showModalAlert = false;
    this.modalAlert = null;
    this.createModel = new ExampleModel();
    setTimeout(() => {
      const firstInput = document.getElementById('field1');
      if (firstInput) {
        (firstInput as HTMLInputElement).focus();
      }
    }, 100);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.getAll(); // Adjust this method to fetch paginated data if needed
  }

  // Method to trigger alert
  triggerAlert(type: string, message: string): void {
    this.alert = { type, message };
    this.showAlert = true;
    setTimeout(() => this.showAlert = false, 3000); // Auto-hide after 3 seconds
  }
}