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
import { NotifcationService } from 'app/shared/services/notification.service';
import { DashboardService } from 'app/shared/services/dashboard.service';
import { AuthService } from 'app/shared/auth/auth.service';

export interface QuotationRequestsCountVM {
  totalQuotations: number;
  newQuotations: number;
  inProgressQuotations: number;
  completedQuotations: number;
}

export interface PurchaseOrdersCountVM {
  totalPurchaseOrders: number;
  openPurchaseOrders: number;
  rejectedPurchaseOrders: number;
  deliveredPurchaseOrders: number;
}

export interface VendorPortalDashboardCountVM {
  totalRfqs: number;
  totalPendingQuotes: number;
  totalPendingDeliveries: number;
  totalIncome: number;
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

export interface VendorTopItemVM {
  itemName: string;
  totalSoldQuantity: number;
  percentage: number; // static for now
}

export interface VendorDashboardAndHistoryInvoicesVM {
  invoiceNo: string;
  purchaseOrderNo: string;
  entityName: string;
  totalAmount: number;
  status: string;
  dueDate: Date;
  statusKey: 'paid' | 'pending for payment';
}

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
  dashboardCounts!: VendorPortalDashboardCountVM;

  metrics = {
    totalRfqs: 0,
    totalPendingQuotes: 0,
    totalPendingDeliveries: 0,
    totalIncome: 0
  };

  incomeRange: IncomeRange = 'year';

  // ---------- Figma panels data ----------
  pendingInvoices: Array<{ no: string; customer: string; amount: number; due: Date }> = [
    { no: 'INV-198', customer: 'Alpha Traders', amount: 1380, due: new Date('2025-12-20') },
    { no: 'INV-201', customer: 'Al Manal Developers', amount: 2000, due: new Date('2025-12-26') },
    { no: 'INV-302', customer: 'Al Manal ET-01', amount: 1257, due: new Date('2025-12-28') },
    { no: 'INV-504', customer: 'Al Manal ET-02', amount: 1500, due: new Date('2025-12-31') },
    { no: 'INV-200', customer: 'Alpha Traders', amount: 500, due: new Date('2025-12-06') },
  ];

  topItems: VendorTopItemVM[] = [];
  vendorDashboardAndHistoryInvoices: VendorDashboardAndHistoryInvoicesVM[] = [];
  companyStatusDonut!: Partial<DonutChartOptions>;
  incomeArea!: Partial<AreaChartOptions>;
  deliveryRadial!: Partial<RadialChartOptions>;


  companyStatusKey: 'new' | 'in-progress' | 'onboarded' | 'none' | 'sent-back' | 'rejected' = 'none';
  companyStatusPercent: number = 33;
  companyStatusLabel: string = 'Onboarded';
  logoUrl: string = "assets/img/icons/vp-color.svg";


  vendorLogo: string | null = null;
  vendorCompanyName: string = '';
  vendorStatus: string = '';
  vendorInitials: string = '';

  constructor(
    private router: Router,
    private companyService: CompanyService,
    private rfqService: RfqService,
    private purchaseOrderService: PurchaseOrderService,
    private messagingService: FirebaseMessagingService,
    private toaster: ToastrService,
    private cdr: ChangeDetectorRef,
    private dashboardService: DashboardService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.incomeArea = this.buildIncomeAreaFromApi([], [], []);
    this.setIncomeRange('year');
    // this.setCompanyStatus('onboarded');
    this.loadCompanyStats();
    this.loadVendorDeliveryPerformance();
    this.loadVendorPortalDashboardCount();
    this.loadVendorTopItems();
    this.loadVendorDashboardAndHistoryInvoices();
    this.loadVendorLogoAndStatus();
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }

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
          return s === 'approve' || s === 'inprogress' || s === 'sendback';
        }).length;

        this.inprogressCount = vendorCompanies.filter(c => {
          const s = (c.status || '').toLowerCase();
          return s === 'inprogress' || s === 'sendback';
        }).length;

        const now = new Date();
        this.newlyOnboardedCount = vendorCompanies.filter(c => {
          if (!c.createdDate) return false;
          const createdDate = new Date(c.createdDate + 'Z');
          const diffInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          const status = (c.status || '').toLowerCase();
          return diffInDays <= 10 && status === 'approve';
        }).length;

        // update donut: Completed/ In Progress
        const completed = Math.max(this.totalCompaniesCount - this.inprogressCount, 0);
        this.updateCompanyDonut(completed, this.inprogressCount);

        this.cdr.detectChanges();
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  completedPercent = 0;
  loadVendorDeliveryPerformance(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.dashboardService.getVendorPortalDeliveryPerformance(userId).subscribe({
      next: (res) => {
        const percent = Number(res?.completionPercentage ?? 0);

        this.completedPercent = Math.round(percent);
        this.buildDeliveryRadial(this.completedPercent);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delivery performance error:', err);
        this.completedPercent = 0;
        this.buildDeliveryRadial(0);
      }
    });
  }

  loadVendorTopItems(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.dashboardService.getVendorTopItems(userId).subscribe({
      next: (res: any[]) => {
        // Static pct for now
        this.topItems = res.map(i => ({
          itemName: i.itemName,
          totalSoldQuantity: i.totalSoldQuantity,
          percentage: i.percentage // static percentage for all items
        }));

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Top items error:', err);
        this.topItems = [];
      }
    });
  }

  loadVendorDashboardAndHistoryInvoices(): void {
    const vendorId = this.authService.getUserId();
    const onlyPending = true;
    this.dashboardService.getVendorDashboardAndHistoryInvoices(vendorId, onlyPending)
      .subscribe(res => {

        const rows = res;

        this.vendorDashboardAndHistoryInvoices = rows.map(r => ({
          invoiceNo: r.invoiceNo,
          purchaseOrderNo: r.purchaseOrderNo,
          entityName: r.entityName,
          totalAmount: r.totalAmount,
          status: r.status,
          dueDate: r.dueDate
        }));
        this.cdr.detectChanges();
      });
  }

  loadVendorLogoAndStatus(): void {
    const vendorId = this.authService.getUserId();
    if (!vendorId) return;

    this.dashboardService.getVendorDashboardLogoAndStatus(vendorId).subscribe({
      next: (res) => {
        const data = res;
        if (data && data.vendorCompanyName) {
          this.vendorCompanyName = data.vendorCompanyName || '';
          this.vendorStatus = data.status || '';
          //this.vendorLogo = data.logo.startsWith('data:') ? data.logo : `data:image/png;base64,${data.logo}`;
          if (data.logo) {
            // Logo exists → show image
            this.vendorLogo = data.logo.startsWith('data:')
              ? data.logo
              : `data:image/png;base64,${data.logo}`;

            this.vendorInitials = '';
          } else {
            // No logo → show initials
            this.vendorLogo = null;
            this.vendorInitials = this.getInitials(this.vendorCompanyName);
          }
          this.setCompanyStatus(this.mapStatus(data.status));
        } else {
          // No company found
          this.vendorCompanyName = '';
          this.vendorStatus = '';
          this.vendorLogo = null;
          this.vendorInitials = '';
          this.setCompanyStatus('none');
        }
        this.cdr.detectChanges();

      },
      error: (err) => {
        console.error('Logo API error:', err);
      }
    });
  }

  private getInitials(name: string | null | undefined): string {
    if (!name) return '';

    const parts = name.trim().split(' ').filter(p => p.length > 0);

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }


  buildDeliveryRadial(completed: number): void {
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
          track: {
            background: '#D3EBDD',
            strokeWidth: '100%',
            margin: 0
          },
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

      case 'sent-back':
        this.companyStatusLabel = 'Sent Back';
        return 'status-pill--red';

      case 'rejected':
        this.companyStatusLabel = 'Rejected';
        return 'status-pill--red';

      case 'none':
        this.companyStatusLabel = 'Not Registered';
        return 'status-pill--orange';

      default:
        this.companyStatusLabel = 'In Progress';
        return 'status-pill--orange';
    }
  }

  loadVendorPortalDashboardCount(): void {
    const userId = localStorage.getItem('userId');
    this.dashboardService.getVendorPortalDashboardCount(userId).subscribe({
      next: (data) => {
        this.dashboardCounts = data;
        this.recomputeTopMetrics();
      },
      error: (err) => console.error('Error fetching dashboard count:', err)
    });
  }

  setCompanyStatus(status: 'new' | 'in-progress' | 'onboarded' | 'none' | 'sent-back' | 'rejected') {
    this.companyStatusKey = status;

    if (status === 'new') {
      this.companyStatusPercent = 33;
      this.companyStatusLabel = 'New';
    } else if (status === 'in-progress') {
      this.companyStatusPercent = 66;
      this.companyStatusLabel = 'In Progress';
    } else if (status === 'sent-back') {
      this.companyStatusPercent = 66;
      this.companyStatusLabel = 'Sent Back';
    } else if (status === 'rejected') {
      this.companyStatusPercent = 100;
      this.companyStatusLabel = 'Rejected';
    } else if (status === 'onboarded') {
      this.companyStatusPercent = 100;
      this.companyStatusLabel = 'Onboarded';
    } else {
      this.companyStatusPercent = 0;
      this.companyStatusLabel = 'Not Registered';
    }
  }

  private mapStatus(status: string | null): 'new' | 'in-progress' | 'onboarded' | 'none' | 'sent-back' | 'rejected' {
    if (!status) return 'none';
    status = status.toLowerCase();

    if (status === 'new') return 'new';
    if (status === 'in progress' || status === 'in-progress' || status === 'inprogress') return 'in-progress';
    if (status === 'sendback') return 'sent-back';
    if (status === 'rejected') return 'rejected';
    if (status === 'onboarded' || status === 'approve') return 'onboarded';

    return 'none';
  }


  private recomputeTopMetrics(): void {
    const totalRfqs = this.dashboardCounts?.totalRfqs ?? 0;
    const totalPendingQuotes = this.dashboardCounts?.totalPendingQuotes ?? 0;

    const totalPendingDeliveries = this.dashboardCounts?.totalPendingDeliveries ?? 0;
    const totalIncome = this.dashboardCounts?.totalIncome ?? 0;

    this.metrics = {
      totalRfqs,
      totalPendingQuotes,
      totalPendingDeliveries,
      totalIncome
    };

    this.cdr.detectChanges();
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

    const userId = localStorage.getItem('userId') || '';
    const filterType = range === 'month' ? 1 : range === 'quarter' ? 2 : 3;

    this.dashboardService.getPurchaseOrderAmountGraphData(userId, filterType).subscribe({
      next: (rows: any[]) => {
        const { labels, values, rawDates } = this.mapIncomeApiToChart(range, rows);
        this.incomeArea = this.buildIncomeAreaFromApi(labels, values, rawDates);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Income graph error:', err)
    });
  }

  private mapIncomeApiToChart(
    range: IncomeRange,
    rows: Array<{ groupData: string; totalAmount: number | null }>
  ): { labels: string[]; values: number[]; rawDates: string[] } {

    const labels: string[] = [];
    const values: number[] = [];
    const rawDates: string[] = [];

    for (const r of rows || []) {
      rawDates.push(r.groupData);
      labels.push(this.formatIncomeLabel(range, r.groupData));
      values.push(Number(r.totalAmount ?? 0));
    }

    return { labels, values, rawDates };
  }


  private buildIncomeAreaFromApi(labels: string[], values: number[], rawDates: string[]): Partial<AreaChartOptions> {
    const compareValues: number[] = []; // keep empty if you don't have prev period

    return {
      series: [
        { name: 'Income', data: values },
        { name: 'Income (Prev)', data: compareValues }
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
        'rgba(102, 199, 155, 0.55)',
        'rgba(154, 164, 160, 0.8)'
      ],

      stroke: {
        curve: 'smooth',
        width: [1.5, 2],
        dashArray: [0, 6],
        lineCap: 'round'
      },

      fill: {
        type: ['gradient', 'solid'],
        gradient: {
          shadeIntensity: 0,
          opacityFrom: 0.40,
          opacityTo: 0.06,
          stops: [0, 85, 100]
        }
      },

      markers: {
        size: [0, 0],
        strokeWidth: 0,
        hover: { size: 6 },
        discrete: []
      },

      grid: {
        borderColor: '#E7EFEA',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { left: 8, right: 8 }
      },

      xaxis: {
        categories: labels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#8B9B93', fontSize: '12px' } },
        crosshairs: {
          show: true,
          stroke: { color: '#2B2F2D', width: 1, dashArray: 4 }
        },
        tooltip: { enabled: false }
      },

      yaxis: {
        tickAmount: 4,
        labels: {
          style: { colors: '#8B9B93', fontSize: '12px' },
          formatter: (v: number) => `${Math.round(v)}`
        }
      },

      dataLabels: { enabled: false },
      legend: { show: false },

      tooltip: {
        shared: true,
        intersect: false,
        custom: ({ series, dataPointIndex }) => {
          const fullDate = this.formatFullDate(rawDates?.[dataPointIndex] ?? labels?.[dataPointIndex] ?? '', this.incomeRange);
          const income = series?.[0]?.[dataPointIndex] ?? 0;

          return `
          <div class="income-tooltip">
            <div class="income-tooltip__title">Revenue on ${fullDate}</div>
            <div class="income-tooltip__row">
              <div class="income-tooltip__value">${this.formatNumber(income)}</div>
            </div>
          </div>
        `;
        }
      }
    };
  }



  // ------------------ navigation ------------------
  // navigateToStatusFilteredQuotations(status: string | null): void {
  //   if (status) this.router.navigate(['/rfq/rfq-list'], { queryParams: { status } });
  //   else this.router.navigate(['/rfq/rfq-list']);
  // }
  navigateToStatusFilteredQuotations(
    status: string | null,
    forPending: boolean = false
  ): void {
    const queryParams: any = {};

    if (status) {
      queryParams.status = status;
    }

    if (forPending) {
      queryParams.forPending = true;
    }

    this.router.navigate(['/rfq/rfq-list'], { queryParams });
  }

  navigateToStatusFilteredPOs(
    status: string | null,
    forPending: boolean = false
  ): void {
    const queryParams: any = {};

    if (status) {
      queryParams.status = status;
    }

    if (forPending) {
      queryParams.forPending = true;
    }

    this.router.navigate(['/purchase-order/purchase-order-list'], { queryParams });
  }


  goToPOs(): void {
    this.router.navigate(['/po/po-list']);
  }

  // goToRfqs(): void {
  //   this.router.navigate(['/rfq/rfq-list']);
  // }
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
    return `${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  private formatIncomeLabel(range: IncomeRange, raw: string): string {
    if (range === 'quarter') return raw;

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;

    if (range === 'month') {
      // 1,2,3,... (day of month)
      return String(d.getDate());
    }

    // year: Jan, Feb, Mar...
    return d.toLocaleDateString(undefined, { month: 'short' });
  }

  private formatFullDate(raw: string, range: IncomeRange): string {
    // QUARTER → "Q4 (Oct – Dec), 2025"
    if (range === 'quarter') {
      const quarterMonths: Record<string, string> = {
        Q1: 'Jan – Mar',
        Q2: 'Apr – Jun',
        Q3: 'Jul – Sep',
        Q4: 'Oct – Dec'
      };

      const year = new Date().getFullYear(); // or derive later
      const months = quarterMonths[raw] ?? '';
      return `${raw} (${months}), ${year}`;
    }

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;

    if (range === 'year') {
      const month = d.toLocaleDateString(undefined, { month: 'short' });
      const year = d.getFullYear();
      return `${month}, ${year}`;
    }

    // MONTH
    const monthDay = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
    const year = d.getFullYear();

    return `${monthDay}, ${weekday}, ${year}`;
  }



}
