import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexStroke,
  ApexFill,
  ApexGrid,
  ApexTooltip,
  ApexLegend,
  ApexResponsive
} from 'ng-apexcharts';
import {
  ReportsService,
  ReportFilterParams,
  SalesReportCharts,
  SalesPurchaseOrderRow,
  SalesInvoiceRow,
  ReportsFilterMetadata,
  PaginatedResult
} from '../services/reports.service';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis;
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  stroke?: ApexStroke;
  fill?: ApexFill;
  grid?: ApexGrid;
  tooltip?: ApexTooltip;
  legend?: ApexLegend;
  colors?: string[];
  labels?: string[];
  responsive?: ApexResponsive[];
};

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss'],
  standalone: false
})
export class SalesReportComponent implements OnInit {
  presets = [
    { value: 'Today', label: 'Today' },
    { value: 'ThisWeek', label: 'This Week' },
    { value: 'ThisMonth', label: 'This Month' },
    { value: 'ThisQuarter', label: 'This Quarter' },
    { value: 'ThisYear', label: 'This Year' },
    { value: 'Custom', label: 'Custom Date Range' }
  ];

  selectedPreset = 'ThisYear';
  customFromDate: string = '';
  customToDate: string = '';
  selectedVendor: string = '';
  selectedPoStatus: string = '';
  selectedCurrency: string = '';

  metadata: ReportsFilterMetadata = {
    vendors: [],
    poStatuses: [],
    shipmentStatuses: [],
    invoiceStatuses: [],
    rfqStatuses: [],
    currencies: []
  };

  chartsData: SalesReportCharts | null = null;

  // Section 2: Commercial Transaction Ledgers (Purchase Order Awarded & Invoice Ledger only)
  activeSection: 'pos' | 'invoices' = 'pos';
  posData: PaginatedResult<SalesPurchaseOrderRow> = this.emptyPage();
  invoicesData: PaginatedResult<SalesInvoiceRow> = this.emptyPage();

  searchTerm: string = '';
  sortBy: string = '';
  sortDirection: 'asc' | 'desc' = 'desc';

  loadingCharts = false;
  loadingTable = false;
  exportingPdf = false;

  // Exhibit 1.1: Sales Revenue Trend
  salesTrendChart: ChartOptions = {
    series: [],
    chart: { type: 'area', height: 225, toolbar: { show: false }, zoom: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#249d57', '#94a3b8'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.22, opacityTo: 0.02 } },
    xaxis: { categories: [], labels: { style: { colors: '#64748b', fontSize: '10.5px' } } },
    yaxis: { labels: { formatter: (val: any) => this.formatShortNum(val), style: { colors: '#64748b', fontSize: '10.5px' } } },
    grid: { strokeDashArray: 3, borderColor: '#e2e8f0' },
    tooltip: { y: { formatter: (val: any) => `${(Number(val) || 0).toLocaleString()} SAR` } },
    legend: { position: 'top', horizontalAlign: 'right', fontWeight: 600, fontSize: '11px' }
  };

  // Exhibit 1.2: Payment & Receivables Breakdown
  paymentAnalysisChart: ChartOptions = {
    series: [],
    chart: { type: 'bar', height: 225, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '42%', borderRadius: 3, distributed: true } },
    dataLabels: { enabled: false },
    colors: ['#16a34a', '#0284c7', '#d97706', '#dc2626'],
    xaxis: { categories: ['Paid', 'Approved', 'Pending', 'Outstanding'], labels: { style: { colors: '#475569', fontSize: '11px', fontWeight: 600 } } },
    yaxis: { labels: { formatter: (val: any) => this.formatShortNum(val), style: { colors: '#64748b', fontSize: '10.5px' } } },
    grid: { strokeDashArray: 3, borderColor: '#e2e8f0' },
    legend: { show: false },
    tooltip: { y: { formatter: (val: any) => `${(Number(val) || 0).toLocaleString()} SAR` } }
  };

  constructor(
    private reportsService: ReportsService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMetadata();
    this.applyFilters();
  }

  private emptyPage<T>(): PaginatedResult<T> {
    return { items: [], totalCount: 0, pageNumber: 1, pageSize: 15, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
  }

  private formatShortNum(val: any): string {
    const n = Number(val) || 0;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return n.toFixed(0);
  }

  loadMetadata(): void {
    this.reportsService.getFiltersMetadata().subscribe({
      next: (meta) => {
        this.metadata = meta;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  getFilterParams(): ReportFilterParams {
    const params: ReportFilterParams = {
      preset: this.selectedPreset,
      currency: this.selectedCurrency || undefined,
      vendorUserId: this.selectedVendor || undefined,
      status: this.selectedPoStatus || undefined,
      searchTerm: this.searchTerm || undefined,
      sortBy: this.sortBy || undefined,
      sortDirection: this.sortDirection
    };

    if (this.selectedPreset === 'Custom') {
      if (this.customFromDate) params.fromDate = this.customFromDate;
      if (this.customToDate) params.toDate = this.customToDate;
    }

    return params;
  }

  applyFilters(): void {
    if (this.selectedPreset === 'Custom' && this.customFromDate && this.customToDate) {
      if (new Date(this.customFromDate) > new Date(this.customToDate)) {
        this.toastr.warning('From Date cannot be later than To Date.');
        return;
      }
    }

    this.loadCharts();
    this.loadAllCountsAndActiveTable(1);
  }

  resetFilters(): void {
    this.selectedPreset = 'ThisYear';
    this.customFromDate = '';
    this.customToDate = '';
    this.selectedVendor = '';
    this.selectedPoStatus = '';
    this.selectedCurrency = '';
    this.searchTerm = '';
    this.sortBy = '';
    this.sortDirection = 'desc';
    this.applyFilters();
  }

  loadCharts(): void {
    this.loadingCharts = true;
    this.reportsService.getSalesReportCharts(this.getFilterParams()).subscribe({
      next: (charts) => {
        this.chartsData = charts;
        this.updateCharts(charts);
        this.loadingCharts = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingCharts = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateCharts(charts: SalesReportCharts): void {
    this.salesTrendChart = {
      ...this.salesTrendChart,
      series: [
        { name: 'Current Period', data: charts.salesTrend.map(t => t.currentSales) },
        { name: 'Prior Period', data: charts.salesTrend.map(t => t.previousSales) }
      ],
      xaxis: { ...this.salesTrendChart.xaxis, categories: charts.salesTrend.map(t => t.period) }
    };

    this.paymentAnalysisChart = {
      ...this.paymentAnalysisChart,
      series: [{
        name: 'Amount (SAR)',
        data: [
          charts.paymentAnalysis.paidAmount,
          charts.paymentAnalysis.approvedAmount,
          charts.paymentAnalysis.pendingAmount,
          charts.paymentAnalysis.outstandingAmount
        ]
      }]
    };
  }

  loadAllCountsAndActiveTable(page: number = 1): void {
    this.loadTable(page);
    const countParams = this.getFilterParams();
    countParams.pageNumber = 1;
    countParams.pageSize = 1;
    if (this.activeSection !== 'invoices') {
      this.reportsService.getSalesInvoices(countParams).subscribe({
        next: (res) => { this.invoicesData.totalCount = res.totalCount; this.cdr.detectChanges(); },
        error: () => {}
      });
    } else {
      this.reportsService.getSalesPurchaseOrders(countParams).subscribe({
        next: (res) => { this.posData.totalCount = res.totalCount; this.cdr.detectChanges(); },
        error: () => {}
      });
    }
  }

  switchSection(sec: 'pos' | 'invoices'): void {
    this.activeSection = sec;
    this.searchTerm = '';
    this.sortBy = '';
    this.sortDirection = 'desc';
    this.loadTable(1);
  }

  loadTable(page: number = 1): void {
    this.loadingTable = true;
    const params = this.getFilterParams();
    params.pageNumber = page;

    if (this.activeSection === 'pos') {
      params.pageSize = this.posData.pageSize;
      this.reportsService.getSalesPurchaseOrders(params).subscribe({
        next: (res) => { this.posData = res; this.loadingTable = false; this.cdr.detectChanges(); },
        error: () => { this.loadingTable = false; this.cdr.detectChanges(); }
      });
    } else {
      params.pageSize = this.invoicesData.pageSize;
      this.reportsService.getSalesInvoices(params).subscribe({
        next: (res) => { this.invoicesData = res; this.loadingTable = false; this.cdr.detectChanges(); },
        error: () => { this.loadingTable = false; this.cdr.detectChanges(); }
      });
    }
  }

  onSearchTable(): void {
    this.loadTable(1);
  }

  onSortTable(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'desc';
    }
    this.loadTable(1);
  }

  printReport(): void {
    window.print();
  }

  exportPdf(): void {
    this.exportingPdf = true;
    this.toastr.info('Generating Sales Report PDF...');
    const params = this.getFilterParams();

    this.reportsService.exportSalesReportPdf(params, 'detailed').subscribe({
      next: (blob) => {
        this.exportingPdf = false;
        const filename = `Sales_Report_${params.preset || 'Report'}_${new Date().toISOString().slice(0, 10)}.pdf`;
        this.reportsService.downloadPdfBlob(blob, filename);
        this.toastr.success('PDF report downloaded successfully.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.exportingPdf = false;
        this.toastr.error('Failed to generate Sales Report PDF.');
        this.cdr.detectChanges();
      }
    });
  }

  get poPageTotal(): number { return this.posData.items.reduce((s, r) => s + r.totalAmount, 0); }
  get poPageInvoiced(): number { return this.posData.items.reduce((s, r) => s + r.invoicedAmount, 0); }

  get invPageTotal(): number { return this.invoicesData.items.reduce((s, r) => s + r.invoiceAmount, 0); }
  get invPagePaid(): number { return this.invoicesData.items.reduce((s, r) => s + r.paidAmount, 0); }
  get invPageOutstanding(): number { return this.invoicesData.items.reduce((s, r) => s + r.outstandingAmount, 0); }

  get loggedInVendorLabel(): string {
    if (this.metadata?.vendors?.length === 1) return this.metadata.vendors[0].label;
    if (this.chartsData?.topVendors?.length === 1) return this.chartsData.topVendors[0].vendorName;
    return 'Authenticated Vendor Account';
  }

  getStatusPillClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('paid') || s.includes('delivered') || s.includes('complete')) return 'status-pill--success';
    if (s.includes('approved') || s.includes('open')) return 'status-pill--info';
    if (s.includes('pending') || s.includes('progress')) return 'status-pill--warning';
    if (s.includes('reject') || s.includes('cancel') || s.includes('lost')) return 'status-pill--danger';
    return 'status-pill--neutral';
  }
}
