import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  SalesReportSummary,
  SalesReportCharts,
  SalesPurchaseOrderRow,
  SalesShipmentRow,
  SalesInvoiceRow,
  SalesPaymentRow,
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
  // Preset options
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
  selectedShipmentStatus: string = '';
  selectedInvoiceStatus: string = '';
  selectedPaymentStatus: string = '';
  selectedCurrency: string = '';

  // Metadata
  metadata: ReportsFilterMetadata = {
    vendors: [],
    poStatuses: [],
    shipmentStatuses: [],
    invoiceStatuses: [],
    rfqStatuses: [],
    currencies: []
  };

  // Summary & Charts
  summary: SalesReportSummary | null = null;
  chartsData: SalesReportCharts | null = null;

  // Active Tab: 'pos' | 'shipments' | 'invoices' | 'payments'
  activeTab: 'pos' | 'shipments' | 'invoices' | 'payments' = 'pos';

  // Table Data & Pagination
  posData: PaginatedResult<SalesPurchaseOrderRow> = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
  shipmentsData: PaginatedResult<SalesShipmentRow> = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
  invoicesData: PaginatedResult<SalesInvoiceRow> = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
  paymentsData: PaginatedResult<SalesPaymentRow> = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false };

  // Search & Sorting per tab
  searchTerm: string = '';
  sortBy: string = '';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Loading States
  loadingSummary = false;
  loadingCharts = false;
  loadingTable = false;
  exportingPdf = false;

  // ApexCharts Configurations
  salesTrendChart: ChartOptions = {
    series: [],
    chart: { type: 'area', height: 320, toolbar: { show: false }, zoom: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    colors: ['#249d57', '#94a3b8'],
    xaxis: { categories: [], labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    yaxis: { labels: { formatter: (val: any) => `${Number(val) >= 1000 ? (Number(val) / 1000).toFixed(1) + 'k' : Number(val).toFixed(0)}`, style: { colors: '#64748b' } } },
    grid: { strokeDashArray: 4, borderColor: '#f1f5f9' },
    tooltip: { y: { formatter: (val: any) => `${(Number(val) || 0).toLocaleString()} SAR` } },
    legend: { position: 'top', horizontalAlign: 'right' }
  };

  poStatusChart: ChartOptions = {
    series: [],
    chart: { type: 'donut', height: 260 },
    labels: [],
    colors: ['#249d57', '#3b82f6', '#f59e0b', '#8b5cf6', '#64748b'],
    legend: { position: 'bottom', horizontalAlign: 'center', fontWeight: 600 },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '13px',
              fontWeight: 700,
              color: '#334155'
            },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a'
            },
            total: {
              show: true,
              label: 'Total POs',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              formatter: () => `${this.summary?.totalPurchaseOrders ?? 0}`
            }
          }
        }
      }
    }
  };

  shipmentStatusChart: ChartOptions = {
    series: [],
    chart: { type: 'donut', height: 260 },
    labels: [],
    colors: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'],
    legend: { position: 'bottom', horizontalAlign: 'center', fontWeight: 600 },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '13px',
              fontWeight: 700,
              color: '#334155'
            },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a'
            },
            total: {
              show: true,
              label: 'Total Shipments',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              formatter: () => `${this.summary?.totalShipments ?? 0}`
            }
          }
        }
      }
    }
  };

  invoiceStatusChart: ChartOptions = {
    series: [],
    chart: { type: 'donut', height: 260 },
    labels: [],
    colors: ['#22c55e', '#0ea5e9', '#f59e0b', '#8b5cf6', '#64748b'],
    legend: { position: 'bottom', horizontalAlign: 'center', fontWeight: 600 },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '13px',
              fontWeight: 700,
              color: '#334155'
            },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a'
            },
            total: {
              show: true,
              label: 'Invoices',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              formatter: () => `${this.chartsData?.invoiceStatusDistribution?.reduce((acc, i) => acc + i.count, 0) ?? 0}`
            }
          }
        }
      }
    }
  };

  paymentAnalysisChart: ChartOptions = {
    series: [],
    chart: { type: 'bar', height: 260, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    colors: ['#22c55e', '#0ea5e9', '#f59e0b', '#ef4444'],
    xaxis: { categories: ['Paid', 'Approved', 'Pending', 'Outstanding'], labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    yaxis: { labels: { formatter: (val: any) => `${Number(val) >= 1000 ? (Number(val) / 1000).toFixed(0) + 'k' : Number(val).toFixed(0)}` } },
    grid: { strokeDashArray: 4, borderColor: '#f1f5f9' },
    tooltip: { y: { formatter: (val: any) => `${(Number(val) || 0).toLocaleString()} SAR` } }
  };

  vendorSalesChart: ChartOptions = {
    series: [],
    chart: { type: 'bar', height: 260, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    colors: ['#249d57'],
    xaxis: { categories: [], labels: { formatter: (val: any) => `${Number(val) >= 1000 ? (Number(val) / 1000).toFixed(0) + 'k' : Number(val).toFixed(0)}` } },
    grid: { strokeDashArray: 4, borderColor: '#f1f5f9' },
    tooltip: { y: { formatter: (val: any) => `${(Number(val) || 0).toLocaleString()} SAR` } }
  };

  constructor(
    private reportsService: ReportsService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMetadata();
    this.applyFilters();
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
      searchTerm: this.searchTerm || undefined,
      sortBy: this.sortBy || undefined,
      sortDirection: this.sortDirection
    };

    if (this.selectedPreset === 'Custom') {
      if (this.customFromDate) params.fromDate = this.customFromDate;
      if (this.customToDate) params.toDate = this.customToDate;
    }

    if (this.activeTab === 'pos' && this.selectedPoStatus) {
      params.status = this.selectedPoStatus;
    } else if (this.activeTab === 'shipments' && this.selectedShipmentStatus) {
      params.status = this.selectedShipmentStatus;
    } else if (this.activeTab === 'invoices' && this.selectedInvoiceStatus) {
      params.status = this.selectedInvoiceStatus;
    } else if (this.activeTab === 'payments' && this.selectedPaymentStatus) {
      params.status = this.selectedPaymentStatus;
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

    this.loadSummary();
    this.loadCharts();
  }

  resetFilters(): void {
    this.selectedPreset = 'ThisYear';
    this.customFromDate = '';
    this.customToDate = '';
    this.selectedVendor = '';
    this.selectedPoStatus = '';
    this.selectedShipmentStatus = '';
    this.selectedInvoiceStatus = '';
    this.selectedPaymentStatus = '';
    this.selectedCurrency = '';
    this.searchTerm = '';
    this.sortBy = '';
    this.sortDirection = 'desc';
    this.applyFilters();
  }

  loadSummary(): void {
    this.loadingSummary = true;
    this.reportsService.getSalesReportSummary(this.getFilterParams()).subscribe({
      next: (data) => {
        this.summary = data;
        this.loadingSummary = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingSummary = false;
        this.toastr.error('Failed to load sales summary.');
        this.cdr.detectChanges();
      }
    });
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
    // 1. Sales Trend
    this.salesTrendChart = {
      ...this.salesTrendChart,
      series: [
        { name: 'Current Period Sales', data: charts.salesTrend.map(t => t.currentSales) },
        { name: 'Previous Period Sales', data: charts.salesTrend.map(t => t.previousSales) }
      ],
      xaxis: { ...this.salesTrendChart.xaxis, categories: charts.salesTrend.map(t => t.period) }
    };

    // 2. PO Status Distribution
    this.poStatusChart = {
      ...this.poStatusChart,
      series: charts.poStatusDistribution.map(p => p.count),
      labels: charts.poStatusDistribution.map(p => p.status),
      colors: charts.poStatusDistribution.map(p => p.color || '#3b82f6')
    };

    // 3. Shipment Status
    this.shipmentStatusChart = {
      ...this.shipmentStatusChart,
      series: charts.shipmentStatusDistribution.map(s => s.count),
      labels: charts.shipmentStatusDistribution.map(s => s.status),
      colors: charts.shipmentStatusDistribution.map(s => s.color || '#22c55e')
    };

    // 4. Invoice Status
    this.invoiceStatusChart = {
      ...this.invoiceStatusChart,
      series: charts.invoiceStatusDistribution.map(i => i.count),
      labels: charts.invoiceStatusDistribution.map(i => i.status),
      colors: charts.invoiceStatusDistribution.map(i => i.color || '#0ea5e9')
    };

    // 5. Payment Analysis
    this.paymentAnalysisChart = {
      ...this.paymentAnalysisChart,
      series: [{
        name: 'Amount',
        data: [
          charts.paymentAnalysis.paidAmount,
          charts.paymentAnalysis.approvedAmount,
          charts.paymentAnalysis.pendingAmount,
          charts.paymentAnalysis.outstandingAmount
        ]
      }]
    };

    // 6. Vendor Performance
    this.vendorSalesChart = {
      ...this.vendorSalesChart,
      series: [{ name: 'Total Sales', data: charts.topVendors.map(v => v.totalSales) }],
      xaxis: { ...this.vendorSalesChart.xaxis, categories: charts.topVendors.map(v => v.vendorName) }
    };
  }

  // ===================== Table Management =====================
  switchTab(tab: 'pos' | 'shipments' | 'invoices' | 'payments'): void {
    this.activeTab = tab;
    this.searchTerm = '';
    this.sortBy = '';
    this.sortDirection = 'desc';
    this.loadTableData();
  }

  loadTableData(page: number = 1): void {
    this.loadingTable = true;
    const params = this.getFilterParams();
    params.pageNumber = page;

    if (this.activeTab === 'pos') {
      params.pageSize = this.posData.pageSize;
      this.reportsService.getSalesPurchaseOrders(params).subscribe({
        next: (res) => { this.posData = res; this.loadingTable = false; this.cdr.detectChanges(); },
        error: () => { this.loadingTable = false; this.cdr.detectChanges(); }
      });
    } else if (this.activeTab === 'shipments') {
      params.pageSize = this.shipmentsData.pageSize;
      this.reportsService.getSalesShipments(params).subscribe({
        next: (res) => { this.shipmentsData = res; this.loadingTable = false; this.cdr.detectChanges(); },
        error: () => { this.loadingTable = false; this.cdr.detectChanges(); }
      });
    } else if (this.activeTab === 'invoices') {
      params.pageSize = this.invoicesData.pageSize;
      this.reportsService.getSalesInvoices(params).subscribe({
        next: (res) => { this.invoicesData = res; this.loadingTable = false; this.cdr.detectChanges(); },
        error: () => { this.loadingTable = false; this.cdr.detectChanges(); }
      });
    } else if (this.activeTab === 'payments') {
      params.pageSize = this.paymentsData.pageSize;
      this.reportsService.getSalesPayments(params).subscribe({
        next: (res) => { this.paymentsData = res; this.loadingTable = false; this.cdr.detectChanges(); },
        error: () => { this.loadingTable = false; this.cdr.detectChanges(); }
      });
    }
  }

  onSearch(): void {
    this.loadTableData(1);
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadTableData(1);
  }

  onPageChange(page: number): void {
    this.loadTableData(page);
  }

  // Drill-down triggers from KPI cards or charts
  drillDownToTab(tab: 'pos' | 'shipments' | 'invoices' | 'payments', statusFilter?: string): void {
    this.activeTab = tab;
    if (tab === 'pos' && statusFilter) this.selectedPoStatus = statusFilter;
    if (tab === 'shipments' && statusFilter) this.selectedShipmentStatus = statusFilter;
    if (tab === 'invoices' && statusFilter) this.selectedInvoiceStatus = statusFilter;
    if (tab === 'payments' && statusFilter) this.selectedPaymentStatus = statusFilter;
    this.loadTableData(1);

    // Scroll smoothly to detailed section
    const el = document.getElementById('details-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  // PDF Export
  exportPdf(type: 'summary' | 'detailed'): void {
    this.exportingPdf = true;
    this.toastr.info(`Preparing ${type === 'summary' ? 'Summary' : 'Detailed'} PDF...`);
    const params = this.getFilterParams();

    this.reportsService.exportSalesReportPdf(params, type).subscribe({
      next: (blob) => {
        this.exportingPdf = false;
        const filename = `SalesReport_${type}_${params.preset || 'report'}_${new Date().toISOString().slice(0, 10)}.pdf`;
        this.reportsService.downloadPdfBlob(blob, filename);
        this.toastr.success('PDF report downloaded successfully.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.exportingPdf = false;
        this.toastr.error('Failed to generate PDF report.');
        this.cdr.detectChanges();
      }
    });
  }

  // Navigation helpers
  viewPo(id: number): void {
    this.router.navigate(['/purchase-order/purchase-order-details', id]);
  }

  viewInvoice(poId: number | undefined, invId: number): void {
    if (poId) {
      this.router.navigate(['/purchase-order/purchase-order-details', poId, 'invoice', invId]);
    }
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('paid') || s.includes('delivered') || s.includes('complete')) return 'badge-success';
    if (s.includes('approved')) return 'badge-info';
    if (s.includes('pending') || s.includes('in progress')) return 'badge-warning';
    if (s.includes('reject') || s.includes('cancel') || s.includes('lost')) return 'badge-danger';
    return 'badge-primary';
  }
}
