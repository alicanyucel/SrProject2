import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { RoleModel, RoleSyncResponse } from '../../../models/role.model';
import { HttpService } from '../../../services/http.service';
import { SwalService } from '../../../services/swal.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-roles',
  standalone: true,  imports: [
    SharedModule, 
    MatButtonModule, 
    MatIconModule, 
    MatTableModule, 
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: RoleModel[] = [];
  filteredRoles: RoleModel[] = [];
  isLoading = false;
  isSyncing = false;
  searchTerm = '';
  syncSuccess = false;
  displayedColumns: string[] = ['roleName', 'description'];

  constructor(
    private httpService: HttpService,
    private swalService: SwalService
  ) {}

  ngOnInit(): void {
    this.getRoles();
  }  getRoles(): void {
    this.isLoading = true;
    this.httpService.post<any[]>('api/Roles/GetRoles', {}, (response) => {
      // API'den gelen tam data'yı sadece roleName ve description olarak map et
      this.roles = response.map(role => ({
        roleName: role.roleName,
        description: role.description
      }));
      this.filteredRoles = [...this.roles];
      this.applyFilter();
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
    });
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredRoles = [...this.roles];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredRoles = this.roles.filter(role => 
        role.roleName.toLowerCase().includes(searchLower) ||
        role.description.toLowerCase().includes(searchLower)
      );
    }
  }
  syncRoles(): void {
    this.isSyncing = true;
    this.syncSuccess = false;
    
    this.httpService.post<RoleSyncResponse>('api/Roles/Sync', {}, (response) => {
      this.isSyncing = false;
      if (response.isSuccessful) {
        this.syncSuccess = true;
        this.swalService.callToast(response.data, 'success');
        // Sync başarılı olunca rolleri yeniden yükle
        this.getRoles();
        
        // Success state'i 3 saniye sonra kaldır
        setTimeout(() => {
          this.syncSuccess = false;
        }, 3000);
      } else {
        this.swalService.callToast('Senkronizasyon başarısız!', 'error');
      }
    }, (error) => {
      this.isSyncing = false;
      this.syncSuccess = false;
    });
  }
}
