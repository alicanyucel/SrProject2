import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwalService } from './swal.service';
import { GlobalFuseAlertService } from './fuse-alert.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private swal : SwalService,
    private fuseAlert: GlobalFuseAlertService
  ) { }  errorHandler(err:HttpErrorResponse){
    console.log('ErrorService handling error:', err);
    // ErrorService artık sadece loglama yapıyor
    // SweetAlert gösterimi HttpService'de yapılıyor
  }
}