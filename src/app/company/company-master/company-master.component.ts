import { Component, OnInit } from '@angular/core';
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
  colors: string[],
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[],
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels,
  stroke: ApexStroke,
  grid: ApexGrid,
  legend?: ApexLegend,
  tooltip?: ApexTooltip,
  plotOptions?: ApexPlotOptions,
  labels?: string[],
  fill: ApexFill,
  markers?: ApexMarkers,
  theme: ApexTheme,
  responsive: ApexResponsive[]
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
  newlyOnboardedCount: number = 0;      // Companies created in last 5 minutes

  constructor(
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
  loadCompanyStats() {
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
        //For Get all companies count
        // const vendorCompanies = companies.filter(c =>
        //   (c.vendorId || '').toLowerCase() === userId.toLowerCase()
        // );

        // this.totalCompaniesCount = vendorCompanies.length;

        //For Get Companies which status is Completed 
        const vendorCompanies = companies.filter(c =>
          (c.vendorId || '').toLowerCase() === userId.toLowerCase()
        );

        // Only count companies where status = "completed"
        this.totalCompaniesCount = vendorCompanies.filter(c =>
          (c.status || '').toLowerCase() === 'approve'
        ).length;




        // Pending Companies: InProgress OR Recalled
        this.inprogressCount = vendorCompanies.filter(c => {
          const status = (c.status || '').toLowerCase();
          return status === 'inprocess' || status === 'sendback';
        }).length;

        // Newly Onboarded Companies: created in last 5 minutes
        // Newly Onboarded Companies: created in last 10 days AND approved
        const now = new Date();
        this.newlyOnboardedCount = vendorCompanies.filter(c => {
          if (!c.createdDate) return false;

          const createdDate = new Date(c.createdDate + 'Z'); // treat as UTC
          const diffInDays = (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          const status = (c.status || '').toLowerCase();

          console.log('Company:', c.vendorId, 'CreatedDate:', createdDate, 'Status:', status, 'DiffInDays:', diffInDays);

          return diffInDays <= 10 && status === 'approve';
        }).length;



        console.log('Total Companies:', this.totalCompaniesCount);
        console.log('Pending Companies:', this.inprogressCount);
        console.log('Newly Onboarded Companies (last 5 mins):', this.newlyOnboardedCount);
      },
      error: (err) => {
        console.error('Error fetching companies:', err);
      }
    });
  }

  onResized(event: any) {
    setTimeout(() => { this.fireRefreshEventOnWindow(); }, 300);
  }

  newCompany() {
    this.router.navigateByUrl("/pages/company-registration");
  }

  companyList(title: string, status?: string) {
    this.router.navigate(['/company/company-list'], {
      queryParams: { title: title, status: status || '' }
    });
  }

  fireRefreshEventOnWindow = function () {
    const evt = document.createEvent("HTMLEvents");
    evt.initEvent("resize", true, false);
    window.dispatchEvent(evt);
  };
}
