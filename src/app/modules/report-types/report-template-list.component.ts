import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportTypesService } from 'app/modules/report-types/report-types.service';

@Component({
  selector: 'app-report-template-list',
  templateUrl: './report-template-list.component.html',
  styleUrls: ['./report-template-list.component.scss']
})
export class ReportTemplateListComponent implements OnInit {
  reportTypeId: string = '';
  templates: any[] = [];
  isLoading = false;

  constructor(private reportTypesService: ReportTypesService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.reportTypeId = params.get('id') || '';
      this.loadTemplates();
    });
  }

  loadTemplates() {
    if (!this.reportTypeId) return;
    this.isLoading = true;
    this.reportTypesService.getTemplates(this.reportTypeId).subscribe(data => {
      this.templates = data;
      this.isLoading = false;
    });
  }

  onEdit(template: any) {
    // Şablon düzenleme işlemi
  }
}
