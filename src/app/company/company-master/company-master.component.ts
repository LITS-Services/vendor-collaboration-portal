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
  columnChartOptions : Partial<ChartOptions>;

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

  totalCompaniesCount: number = 0;   // <-- Total companies
  inprogressCount: number = 0;       // <-- Pending companies

  constructor(private router: Router,
              private modalService: NgbModal,
              private companyService: CompanyService) { 
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
    this.companyService.getCompanies().subscribe({
      next: (res: any) => {
        const companies = res?.$values || res || [];
        this.totalCompaniesCount = companies.length;
        this.inprogressCount = companies.filter((c: any) => c.status?.toLowerCase() === 'inprogress').length;
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
    this.router.navigate(['/pages/company-registeration']);
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
