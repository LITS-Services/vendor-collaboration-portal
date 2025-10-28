import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as Chartist from 'chartist';
import { ChartType, ChartEvent } from "ng-chartist";
import ChartistTooltip from 'chartist-plugin-tooltips-updated';

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
  ApexResponsive
} from "ng-apexcharts";
import { Router } from '@angular/router';
import { CompanyService } from '../../shared/services/company.service'; // <-- Import your service
import { RfqService } from 'app/shared/services/rfq.service';
import { FirebaseMessagingService } from 'app/firebase-messaging.service';
import { ToastrService } from 'ngx-toastr';

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

export interface QuotationRequestsCountVM {
  totalQuotations: number;
  newQuotations: number;
  inProcessQuotations: number;
  completedQuotations: number;
}

var $info = "#249D57",
  $info_light = "#BDE2CD"
var themeColors = [$info, $info_light];

export interface Chart {
  type: ChartType;
  data: Chartist.IChartistData;
  options?: any;
  responsiveOptions?: any;
  events?: ChartEvent;
  // plugins?: any;
}

@Component({
  selector: 'app-dashboard1',
  templateUrl: './dashboard1.component.html',
  styleUrls: ['./dashboard1.component.scss']
})

export class Dashboard1Component implements OnInit {
  columnChartOptions: Partial<ChartOptions>;
  @Output() statusSelected = new EventEmitter<string | null>();
  totalCompaniesCount: number = 0;
  inprogressCount: number = 0;
  newlyOnboardedCount: number = 0;
  rfqCounts!: QuotationRequestsCountVM;

  constructor(private router: Router,
     private companyService: CompanyService,
      private rfqService: RfqService,
      private messagingService: FirebaseMessagingService,
      private toaster: ToastrService,
      private cdr: ChangeDetectorRef
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
      tooltip: {
        y: { formatter: function (val) { return "$" + val + " thousands"; } }
      }
    }
  }

  ngOnInit() {
    this.loadCompanyStats();
    this.loadQuotationRequestsCounts();
  }

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
        const vendorCompanies = companies.filter(c =>
          (c.vendorId || '').toLowerCase() === userId.toLowerCase()
        );

        // Only count companies where status = "completed"
        this.totalCompaniesCount = vendorCompanies.filter(c =>
          (c.status || '').toLowerCase() === 'approve' ||
          (c.status || '').toLowerCase() === 'inprocess' ||
          (c.status || '').toLowerCase() === 'sendback').length;

        this.cdr.detectChanges();

        // Pending Companies: InProgress OR Recalled
        this.inprogressCount = vendorCompanies.filter(c => {
          const status = (c.status || '').toLowerCase();
          return status === 'inprocess' || status === 'sendback';
        }).length;
        this.cdr.detectChanges();

        // Newly Onboarded Companies: created in last 10 days AND approved
        const now = new Date();
        this.newlyOnboardedCount = vendorCompanies.filter(c => {
          if (!c.createdDate) return false;
          const createdDate = new Date(c.createdDate + 'Z'); // treat as UTC
          const diffInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          const status = (c.status || '').toLowerCase();
          return diffInDays <= 10 && status === 'approve';
        }).length;
        this.cdr.detectChanges();

        console.log('Stats:', {
          total: this.totalCompaniesCount,
          inprogress: this.inprogressCount,
          newlyOnboarded: this.newlyOnboardedCount
        });
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  loadQuotationRequestsCounts(): void {
    this.rfqService.getQuotationRequestsCount().subscribe({
      next: (data) => {
        this.rfqCounts = data;
      },
      error: (err) => {
        console.error('Error fetching quotation requests count:', err);
      }
    });
    this.cdr.detectChanges();

  }

  navigateToStatusFilteredQuotations(status: string | null) {
    if (status) {
      this.router.navigate(['/rfq/rfq-list'], { queryParams: { status } });
    } else {
      this.router.navigate(['/rfq/rfq-list']); // Total (no filter)
    }
  }

  // Donut chart configuration Starts
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

  // Bar chart configuration Starts
  BarChart: Chart = {
    type: 'Bar', data: data['DashboardBar'], options: {
      axisX: { showGrid: false },
      axisY: { showGrid: false, showLabel: false, offset: 0 },
      low: 0,
      high: 60,
    },
    responsiveOptions: [
      ['screen and (max-width: 640px)', {
        seriesBarDistance: 5,
        axisX: { labelInterpolationFnc: (value: string) => value[0] }
      }]
    ],
    events: {
      created(data: any): void {
        const defs = data.svg.elem('defs');
        defs.elem('linearGradient', { id: 'gradient4', x1: 0, y1: 1, x2: 0, y2: 0 })
          .elem('stop', { offset: 0, 'stop-color': '#8E1A38' })
          .parent().elem('stop', { offset: 1, 'stop-color': '#FAA750' });
        defs.elem('linearGradient', { id: 'gradient5', x1: 0, y1: 1, x2: 0, y2: 0 })
          .elem('stop', { offset: 0, 'stop-color': '#1750A5' })
          .parent().elem('stop', { offset: 1, 'stop-color': '#40C057' });
        defs.elem('linearGradient', { id: 'gradient6', x1: 0, y1: 1, x2: 0, y2: 0 })
          .elem('stop', { offset: 0, 'stop-color': '#3B1C93' })
          .parent().elem('stop', { offset: 1, 'stop-color': '#60AFF0' });
        defs.elem('linearGradient', { id: 'gradient7', x1: 0, y1: 1, x2: 0, y2: 0 })
          .elem('stop', { offset: 0, 'stop-color': '#562DB7' })
          .parent().elem('stop', { offset: 1, 'stop-color': '#F55252' });
      },
      draw(data: any): void {
        if (data.type === 'bar') {
          data.element.attr({ y1: 195, x1: data.x1 + 0.001 });
        }
      }
    },
  };

  onResized(event: any) {
    setTimeout(() => { this.fireRefreshEventOnWindow(); }, 300);
  }

  goToAllVendorQuotations() {
    const userId = localStorage.getItem('userId'); // assuming saved on login
    this.router.navigate(['/rfq/rfq-list'], { queryParams: { userId: userId } });
  }

  fireRefreshEventOnWindow = function () {
    const evt = document.createEvent("HTMLEvents");
    evt.initEvent("resize", true, false);
    window.dispatchEvent(evt);
  };
}
