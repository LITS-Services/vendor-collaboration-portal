import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexNonAxisChartSeries
} from 'ng-apexcharts';

import { CompanyService } from '../../shared/services/company.service';
import { RfqService } from 'app/shared/services/rfq.service';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';
import { FirebaseMessagingService } from 'app/firebase-messaging.service';
import { ToastrService } from 'ngx-toastr';

export interface QuotationRequestsCountVM {
  totalQuotations: number;
  newQuotations: number;
  inProcessQuotations: number;
  completedQuotations: number;
}

export interface PurchaseOrdersCountVM {
  totalPurchaseOrders: number;
  awardedPurchaseOrders: number;
  rejectedPurchaseOrders: number;
  deliveredPurchaseOrders: number;
}

type IncomeRange = 'month' | 'quarter' | 'year';

type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  responsive: ApexResponsive[];
};

type AreaChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  fill: ApexFill;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  markers: ApexMarkers;
  legend: ApexLegend;
    colors?: string[];
};

type RadialChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  labels: string[];
  fill: ApexFill;
  tooltip: ApexTooltip;
  colors?: string[];
};

@Component({
  selector: 'app-dashboard1',
  templateUrl: './dashboard1.component.html',
  styleUrls: ['./dashboard1.component.scss'],
  standalone: false
})
export class Dashboard1Component implements OnInit {
  @Output() statusSelected = new EventEmitter<string | null>();

  totalCompaniesCount = 0;
  inprogressCount = 0;
  newlyOnboardedCount = 0;

  rfqCounts!: QuotationRequestsCountVM;
  poCounts!: PurchaseOrdersCountVM;

  // top cards (derived)
  metrics = {
    totalRfq: 0,
    pendingQuotes: 0,
    pendingDeliveries: 0,
    totalIncome: 0
  };

  incomeRange: IncomeRange = 'year';

  // ---------- Figma panels data ----------
  pendingInvoices: Array<{ no: string; customer:string; amount: number; due: Date }> = [
    { no: 'INV-198', customer:'Alpha Traders', amount: 1380, due: new Date('2025-12-20') },
    { no: 'INV-201', customer:'Al Manal Developers', amount: 2000, due: new Date('2025-12-26') },
    { no: 'INV-302', customer:'Al Manal ET-01', amount: 1257, due: new Date('2025-12-28') },
    { no: 'INV-504', customer:'Al Manal ET-02', amount: 1500, due: new Date('2025-12-31') },
    { no: 'INV-200', customer:'Alpha Traders', amount: 500, due: new Date('2025-12-06') },
  ];

  topItems: Array<{ name: string; amountLabel: string; pct: number }> = [
    { name: 'Macbook', amountLabel: '398.05K', pct: 35 },
    { name: 'iPhone 17 Pro Max', amountLabel: '229.9K', pct: 25 },
    { name: 'iPad', amountLabel: '326.04K', pct: 10 },
    { name: 'Others', amountLabel: '229.9K', pct: 30 }
  ];

  // ---------- Charts ----------
  companyStatusDonut!: Partial<DonutChartOptions>;
  incomeArea!: Partial<AreaChartOptions>;
  deliveryRadial!: Partial<RadialChartOptions>;

  // theme tokens
  private readonly primary = '#249D57';
  private readonly primarySoft = '#BDE2CD';

  companyStatusKey: 'new' | 'in-progress' | 'onboarded' = 'onboarded'; // fixed for now
  companyStatusPercent:number = 33;
  companyStatusLabel = 'onboarded';
  logoUrl = "assets/img/icons/vp-color.svg";

  constructor(
    private router: Router,
    private companyService: CompanyService,
    private rfqService: RfqService,
    private purchaseOrderService: PurchaseOrderService,
    private messagingService: FirebaseMessagingService,
    private toaster: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initCharts();
    this.setCompanyStatus('onboarded');
    this.loadCompanyStats();
    this.loadQuotationRequestsCounts();
    this.loadPurchaseOrdersCount();
    this.buildDeliveryRadialDummy();

    // optional: refresh apex on first paint for scaling issues
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }

  // ------------------ API loaders (your logic kept) ------------------
  loadCompanyStats(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.companyService.getCompanyByVendorId(userId).subscribe({
      next: (res: any) => {
        let companies: any[] = [];
        if (Array.isArray(res)) companies = res;
        else if (res?.$values && Array.isArray(res.$values)) companies = res.$values;
        else if (res?.vendorId) companies = [res];

        const vendorCompanies = companies.filter(c => (c.vendorId || '').toLowerCase() === userId.toLowerCase());

        this.totalCompaniesCount = vendorCompanies.filter(c => {
          const s = (c.status || '').toLowerCase();
          return s === 'approve' || s === 'inprocess' || s === 'sendback';
        }).length;

        this.inprogressCount = vendorCompanies.filter(c => {
          const s = (c.status || '').toLowerCase();
          return s === 'inprocess' || s === 'sendback';
        }).length;

        const now = new Date();
        this.newlyOnboardedCount = vendorCompanies.filter(c => {
          if (!c.createdDate) return false;
          const createdDate = new Date(c.createdDate + 'Z');
          const diffInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          const status = (c.status || '').toLowerCase();
          return diffInDays <= 10 && status === 'approve';
        }).length;

        // update donut: Completed vs In Progress
        const completed = Math.max(this.totalCompaniesCount - this.inprogressCount, 0);
        this.updateCompanyDonut(completed, this.inprogressCount);

        this.cdr.detectChanges();
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  completedPercent = 75;

  buildDeliveryRadialDummy(): void {
  const completed = this.completedPercent;

  this.deliveryRadial = {
    series: [completed],

    chart: {
      type: 'radialBar',
      height: 360,
      width: '100%',
      offsetY: -15,
      sparkline: { enabled: true },
      toolbar: { show: false },
      animations: { enabled: false }
    },

    colors: ['#249D57'],
    
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,

        // more center space for the text + legend (like figma)
        // hollow: { size: '62%' },

        track: {
          background: '#D3EBDD',
          strokeWidth: '100%',
          margin: 0
        },

        // we will show our own text, so hide apex labels
        dataLabels: {
          name: { show: false },
          value: { show: false }
        }
      }
    },

    stroke: {
      lineCap: 'butt',
      dashArray: 4
    },

    fill: { type: 'solid' },
    tooltip: { enabled: false }
  };
}

get statusPillClass(): string {
  switch (this.companyStatusKey) {
    case 'onboarded':
      this.companyStatusLabel = 'Onboarded';
      return 'status-pill--green';

    case 'new':
      this.companyStatusLabel = 'New';
      return 'status-pill--blue';

    default:
      this.companyStatusLabel = 'In Progress';
      return 'status-pill--orange';
  }
}

  loadQuotationRequestsCounts(): void {
    this.rfqService.getQuotationRequestsCount().subscribe({
      next: (data) => {
        this.rfqCounts = data;
        this.recomputeTopMetrics();
      },
      error: (err) => console.error('Error fetching quotation requests count:', err)
    });
  }

  loadPurchaseOrdersCount(): void {
    const userId = localStorage.getItem('userId');
    this.purchaseOrderService.getPurchaseOrdersCount(userId).subscribe({
      next: (data) => {
        this.poCounts = data;
        this.recomputeTopMetrics();
      },
      error: (err) => console.error('Error fetching purchase orders count:', err)
    });
  }





  setCompanyStatus(status: 'new' | 'in-progress' | 'onboarded') {
  this.companyStatusKey = status;

  if (status === 'new') {
    this.companyStatusPercent = 33;
    this.companyStatusLabel = 'New';
  } else if (status === 'in-progress') {
    this.companyStatusPercent = 66;
    this.companyStatusLabel = 'In Progress';
  } else {
    this.companyStatusPercent = 100;
    this.companyStatusLabel = 'Completed';
  }
}
  

  // ------------------ Figma metrics mapping ------------------
  private recomputeTopMetrics(): void {
    const totalRfq = this.rfqCounts?.totalQuotations ?? 0;
    const pendingQuotes = this.rfqCounts?.inProcessQuotations ?? 0;

    const totalPO = this.poCounts?.totalPurchaseOrders ?? 0;
    const deliveredPO = this.poCounts?.deliveredPurchaseOrders ?? 0;
    const pendingDeliveries = 125;

    const totalIncome = 8964

    this.metrics = {
      totalRfq,
      pendingQuotes,
      pendingDeliveries,
      totalIncome
    };

    this.cdr.detectChanges();
  }

  // ------------------ Charts init + updates ------------------
  private initCharts(): void {
    // Company Status donut (Completed vs In Progress)
    this.companyStatusDonut = {
      series: [70, 30],
      labels: ['Completed', 'In Progress'],
      chart: {
        type: 'donut',
        height: 250,
        toolbar: { show: false },
        animations: { enabled: false }
      },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '78%',
            labels: {
              show: true,
              name: { show: false },
              value: {
                show: true,
                fontSize: '22px',
                fontWeight: 700,
                formatter: (val: string) => `${Math.round(Number(val) || 0)}%`
              },
              total: {
                show: true,
                label: '',
                formatter: (w: any) => {
                  const s = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                  const completed = w.globals.seriesTotals[0] || 0;
                  const pct = s ? Math.round((completed / s) * 100) : 0;
                  return `${pct}%`;
                }
              }
            }
          }
        }
      },
      legend: { show: false },
      tooltip: { enabled: true },
      responsive: [
        {
          breakpoint: 576,
          options: {
            chart: { height: 220 }
          }
        }
      ]
    };

    // Income area (Figma style)
    this.incomeArea = this.buildIncomeArea('year');
  }

  private updateCompanyDonut(completed: number, inProgress: number): void {
    const c = Math.max(completed, 0);
    const p = Math.max(inProgress, 0);

    this.companyStatusDonut = {
      ...this.companyStatusDonut,
      series: [c, p]
    };

    this.cdr.detectChanges();
  }

  setIncomeRange(range: IncomeRange): void {
    this.incomeRange = range;
    this.incomeArea = this.buildIncomeArea(range);

    // keep top card Total Income synced
    this.recomputeTopMetrics();

    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  }

private buildIncomeArea(range: IncomeRange): Partial<AreaChartOptions> {
  const config = this.getIncomeData(range);

  // If you don’t have comparison data, just set it to [] and it won’t show.
  const compareValues = [];

  return {
    series: [
      { name: 'Income', data: config.values },
      { name: 'Income (Prev)', data: compareValues } // dotted grey line
    ],

    chart: {
      type: 'area',
      height: 240,
      toolbar: { show: false },
      animations: { enabled: false },
      zoom: { enabled: false },
      fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
    },

      colors: [
      'rgba(102, 199, 155, 0.55)', // main green (lighter stroke)
      'rgba(154, 164, 160, 0.8)'   // comparison line
    ],

    stroke: {
      curve: 'smooth',
      width: [1.5, 2],
      dashArray: [0, 6], // 2nd series dotted
      lineCap: 'round'
    },

    fill: {
      type: ['gradient', 'solid'],
      gradient: {
        shadeIntensity: 0,
        opacityFrom: 0.40,   // ⬆ more visible area
        opacityTo: 0.06,     // fades nicely
        stops: [0, 85, 100]
      }
    },

    markers: {
      size: [0, 0],
      strokeWidth: 0,
      hover: { size: 6 },
      discrete: [] // optional: you can set a fixed dot on a point if you want
    },

    grid: {
      borderColor: '#E7EFEA',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 8, right: 8 }
    },

    xaxis: {
      categories: config.labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: '#8B9B93', fontSize: '12px' }
      },
      crosshairs: {
        show: true,
        stroke: {
          color: '#2B2F2D',
          width: 1,
          dashArray: 4
        }
      },
      tooltip: { enabled: false }
    },

    yaxis: {
      tickAmount: 4,
      labels: {
        style: { colors: '#8B9B93', fontSize: '12px' },
        formatter: (v: number) => `AED ${Math.round(v)}`
      }
    },

    dataLabels: { enabled: false },

    legend: { show: false },

    tooltip: {
  shared: true,
  intersect: false,
  custom: ({ series, dataPointIndex, w }) => {
    const label = w.globals.labels?.[dataPointIndex] ?? '';
    const income = series?.[0]?.[dataPointIndex] ?? 0;
    return `
      <div class="income-tooltip">
        <div class="income-tooltip__title"> <span> Revenue: </span> ${label}</div>
        <div class="income-tooltip__row">
          <div class="income-tooltip__value">
            AED ${this.formatNumber(income)}
          </div>
        </div>
      </div>
    `;
  }
}
  };
}
  private getIncomeData(range: IncomeRange): { labels: string[]; values: number[] } {
    // Replace this with real API later; UI stays same.
    if (range === 'month') {
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: [4200, 5150, 4600, 6200]
      };
    }
    if (range === 'quarter') {
      return {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        values: [14500, 12100, 17500, 9800]
      };
    }
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      values: [5200, 6100, 8200, 5150, 10400, 7500, 6900, 12000, 17800, 13200, 4600, 5100]
    };
  }

  // ------------------ navigation ------------------
  navigateToStatusFilteredQuotations(status: string | null): void {
    if (status) this.router.navigate(['/rfq/rfq-list'], { queryParams: { status } });
    else this.router.navigate(['/rfq/rfq-list']);
  }

  goToPOs(): void {
    this.router.navigate(['/po/po-list']);
  }

  goToIncome(): void {
    // optional route
    // this.router.navigate(['/reports/income']);
  }

  goToInvoices(): void {
    this.router.navigate(['/invoices']);
  }

  // ------------------ formatting helpers ------------------
  formatNumber(val: any): string {
    const n = Number(val) || 0;
    return n.toLocaleString();
  }

  formatCurrency(val: any): string {
    const n = Number(val) || 0;
    // change AED/$ etc as per your app
    return `AED ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
}
