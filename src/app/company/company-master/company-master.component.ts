import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompanyService } from 'app/shared/services/company.service';
declare var require: any;

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexDataLabels,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexLegend,
  ApexPlotOptions,
  ApexFill,
  ApexMarkers,
  ApexTheme,
  ApexNonAxisChartSeries,
  ApexResponsive,
} from "ng-apexcharts";

import { ChartEvent, ChartType } from 'ng-chartist';
const data: any = require('../../shared/data/chartist.json');

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  colors: string[];
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  grid: ApexGrid;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  plotOptions?: ApexPlotOptions;
  labels?: string[];
  fill: ApexFill;
  markers?: ApexMarkers;
  theme: ApexTheme;
  responsive: ApexResponsive[];
};

var $info = "#249D57",
  $info_light = "#BDE2CD";
var themeColors = [$info, $info_light];

export interface Chart {
  type: ChartType;
  data: Chartist.IChartistData;
  options?: any;
  responsiveOptions?: any;
  events?: ChartEvent;
}

@Component({
  selector: 'app-company-master',
  templateUrl: './company-master.component.html',
  styleUrls: ['./company-master.component.scss']
})
export class CompanyMasterComponent implements OnInit {
  columnChartOptions: Partial<ChartOptions>;

  DonutChart: Chart = {
    type: 'Pie',
    data: data['donutDashboard'],
    options: {
      donut: true,
      startAngle: 0,
      labelInterpolationFnc: function (value) {
        const total = data['donutDashboard'].series.reduce((prev: any, series: any) => prev + series.value, 0);
        return total + '%';
      }
    },
    events: {
      draw(data: any): void {
        if (data.type === 'label') {
          if (data.index === 0) {
            data.element.attr({
              dx: data.element.root().width() / 2,
              dy: data.element.root().height() / 2
            });
          } else {
            data.element.remove();
          }
        }
      }
    }
  };

  totalCompaniesCount: number = 0;      // Total companies
  inprogressCount: number = 0;          // Pending companies
  newlyOnboardedCount: number = 0;      // Companies where ALL entities are completed
  showRegisterButton: boolean = true;   // ✅ Controls button visibility

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal,
    private companyService: CompanyService
  ) {
    this.columnChartOptions = {
      chart: {
        height: 350,
        type: 'bar',
        toolbar: { show: false },
        animations: { enabled: false }
      },
      colors: themeColors,
      plotOptions: {
        bar: {
          horizontal: false,
          endingShape: 'rounded',
          columnWidth: '25%',
        },
      },
      grid: { borderColor: "#BDBDBD44" },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      series: [
        { name: 'Net Profit', data: [40, 50, 110, 90, 85, 115, 100, 90] },
        { name: 'Revenue', data: [30, 40, 100, 80, 75, 105, 90, 80] }
      ],
      legend: { show: false },
      xaxis: {
        categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        axisBorder: { color: "#BDBDBD44" }
      },
      tooltip: { y: { formatter: (val) => "$" + val + " thousands" } }
    };
  }

  ngOnInit(): void {
    this.loadCompanyStats();
  }

  // Load companies and calculate counts
  loadCompanyStats(): void {
    const userId = localStorage.getItem('userId');
    console.log('userId =', userId);

    if (!userId) {
      console.error('No user ID found in localStorage');
      return;
    }

    this.companyService.getCompanyByVendorId(userId).subscribe({
      next: (res: any) => {
        console.log('API raw response:', res);

        let companies: any[] = [];

        if (Array.isArray(res)) {
          companies = res;
        } else if (res?.$values && Array.isArray(res.$values)) {
          companies = res.$values;
        } else if (res?.vendorId) {
          companies = [res]; // single object response
        }

        console.log('Parsed companies:', companies);

        // ✅ Hide button if any company exists
        this.showRegisterButton = companies.length === 0;

        // Filter vendor's companies
        const vendorCompanies = companies.filter(c =>
          (c.vendorId || '').toLowerCase() === userId.toLowerCase()
        );

        console.log('Vendor companies:', vendorCompanies);

        // 1. Total Companies Count - All companies of this vendor
        this.totalCompaniesCount = vendorCompanies.length;
        console.log('Total Companies Count:', this.totalCompaniesCount);

        // 2. InProgress Count - Companies with ANY entity InProcess OR SendBack OR any status other than Completed
        this.inprogressCount = vendorCompanies.filter(company => {
          const entities = company.vendorUseCompaniesVM || [];
          
          // If no entities, count as pending
          if (entities.length === 0) {
            console.log(`Company "${company.name}" - No entities, counted as pending`);
            return true;
          }
          
          // Company is in progress if ANY entity is NOT Completed
          const hasIncompleteEntities = entities.some((entity: any) => {
            const status = (entity.status || '').toLowerCase();
            const isCompleted = status === 'completed';
            if (!isCompleted) {
              console.log(`Company "${company.name}" - Entity "${entity.entityName}" status: ${status} (not completed)`);
            }
            return !isCompleted;
          });
          
          console.log(`Company "${company.name}" - Has incomplete entities:`, hasIncompleteEntities);
          return hasIncompleteEntities;
        }).length;
        console.log('InProgress/Pending Count:', this.inprogressCount);

        // 3. Onboarded Companies Count - Companies where ALL entities are Completed
        this.newlyOnboardedCount = vendorCompanies.filter(company => {
          const entities = company.vendorUseCompaniesVM || [];
          
          // If no entities, don't count as onboarded
          if (entities.length === 0) {
            console.log(`Company "${company.name}" - No entities, not counted as onboarded`);
            return false;
          }
          
          // Check if ALL entities have status "Completed"
          const allCompleted = entities.every((entity: any) => {
            const status = (entity.status || '').toLowerCase();
            const isCompleted = status === 'completed';
            if (!isCompleted) {
              console.log(`Company "${company.name}" - Entity "${entity.entityName}" status: ${status} (not completed)`);
            }
            return isCompleted;
          });
          
          console.log(`Company "${company.name}" - All entities completed:`, allCompleted);
          return allCompleted;
        }).length;

        console.log('Onboarded Companies Count (ALL entities completed):', this.newlyOnboardedCount);

        // Verification - ensure counts add up correctly
        const calculatedTotal = this.inprogressCount + this.newlyOnboardedCount;
        console.log('Verification - Total:', this.totalCompaniesCount, 
                   'InProgress:', this.inprogressCount, 
                   'Onboarded:', this.newlyOnboardedCount,
                   'Calculated Sum:', calculatedTotal,
                   'Matches:', this.totalCompaniesCount === calculatedTotal);

        // Trigger change detection
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching companies:', err);
      }
    });
  }

  onResized(event: any): void {
    setTimeout(() => { this.fireRefreshEventOnWindow(); }, 300);
  }

  newCompany(): void {
    this.router.navigateByUrl("/pages/company-registration");
  }

  companyList(title: string, status?: string): void {
    this.router.navigate(['/company/company-list'], {
      queryParams: { title: title, status: status || '' }
    });
  }

  // Navigate to onboarded companies list
  viewOnboardedCompanies(): void {
    this.companyList('Onboarded Companies', 'completed');
  }

  // Navigate to pending companies list
  viewPendingCompanies(): void {
    this.companyList('Pending Companies', 'inprogress');
  }

  // Navigate to all companies list
  viewAllCompanies(): void {
    this.companyList('All Companies');
  }

  fireRefreshEventOnWindow(): void {
    const evt = document.createEvent("HTMLEvents");
    evt.initEvent("resize", true, false);
    window.dispatchEvent(evt);
  }
}