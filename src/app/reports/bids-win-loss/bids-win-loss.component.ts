import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  ReportsService,
  ReportFilterParams,
  BidAnalysisSummary,
  BidWinLossCharts,
  BidAnalysisRow,
  RfqSummaryRow,
  ReportsFilterMetadata,
  PaginatedResult
} from '../services/reports.service';
import { ChartOptions } from '../sales-report/sales-report.component';

@Component({
  selector: 'app-bids-win-loss',
  templateUrl: './bids-win-loss.component.html',
  styleUrls: ['./bids-win-loss.component.scss'],
  standalone: false
})
export class BidsWinLossComponent implements OnInit {
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
  selectedRfqStatus: string = '';
  selectedOutcome: string = '';
  selectedCurrency: string = '';

  metadata: ReportsFilterMetadata = {
    vendors: [],
    poStatuses: [],
    shipmentStatuses: [],
    invoiceStatuses: [],
    rfqStatuses: [],
    currencies: []
  };

  summary: BidAnalysisSummary | null = null;
  chartsData: BidWinLossCharts | null = null;

  // Section 3: Bid & RFQ Outcomes
  activeSection: 'bids' | 'rfqs' = 'bids';
  bidsData: PaginatedResult<BidAnalysisRow> = this.emptyPage();
  rfqsData: PaginatedResult<RfqSummaryRow> = this.emptyPage();

  searchTerm: string = '';
  sortBy: string = '';
  sortDirection: 'asc' | 'desc' = 'desc';

  loadingCharts = false;
  loadingTable = false;
  exportingPdf = false;
  showFilterBar = true;

  // Exhibit 1.1: Won vs Lost Quotes Trend
  winLossTrendChart: ChartOptions = {
    series: [],
    chart: {
      type: 'area',
      height: 240,
      toolbar: { show: false },
      animations: { enabled: false },
      zoom: { enabled: false },
      fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'
    },
    colors: [
      'rgba(102, 199, 155, 0.65)',
      'rgba(248, 113, 113, 0.55)'
    ],
    stroke: {
      curve: 'smooth',
      width: [1.8, 1.8],
      dashArray: [0, 4],
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
      categories: [],
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
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial',
      fontWeight: 500,
      labels: { colors: '#8B9B93' },
      itemMargin: { horizontal: 8, vertical: 0 }
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ series, dataPointIndex, w }) => {
        const period = w?.globals?.categoryLabels?.[dataPointIndex] || w?.globals?.labels?.[dataPointIndex] || '';
        const won = series?.[0]?.[dataPointIndex] ?? 0;
        const lost = series?.[1]?.[dataPointIndex] ?? 0;

        return `
          <div class="income-tooltip">
            <div class="income-tooltip__title">${period}</div>
            <div class="income-tooltip__row">
              <span class="income-tooltip__dot" style="background: rgba(102, 199, 155, 1);"></span>
              <span class="income-tooltip__label">Won Quotes:</span>
              <div class="income-tooltip__value">${won}</div>
            </div>
            <div class="income-tooltip__row" style="margin-top: 4px;">
              <span class="income-tooltip__dot" style="background: rgba(248, 113, 113, 1);"></span>
              <span class="income-tooltip__label">Lost Quotes:</span>
              <div class="income-tooltip__value" style="font-size: 15px; opacity: 0.85;">${lost}</div>
            </div>
          </div>
        `;
      }
    }
  };

  // Exhibit 1.2: Bid Outcome Distribution
  outcomeDonutChart: ChartOptions = {
    series: [],
    chart: { type: 'donut', height: 225 },
    labels: ['Won', 'Lost', 'Pending'],
    colors: ['#16a34a', '#dc2626', '#d97706'],
    legend: { position: 'bottom', horizontalAlign: 'center', fontWeight: 600, fontSize: '11px' },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            name: { show: true, fontSize: '12px', fontWeight: 700, color: '#334155' },
            value: { show: true, fontSize: '18px', fontWeight: 800, color: '#0f172a' },
            total: {
              show: true,
              label: 'Total Quotes',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#0f172a',
              formatter: () => `${this.summary?.totalBidsReceived ?? 0}`
            }
          }
        }
      }
    }
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
    return { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
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
      status: this.selectedOutcome || (this.selectedRfqStatus ? this.selectedRfqStatus : undefined),
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

    this.loadSummary();
    this.loadCharts();
    this.loadAllCountsAndActiveTable(1);
  }

  resetFilters(): void {
    this.selectedPreset = 'ThisYear';
    this.customFromDate = '';
    this.customToDate = '';
    this.selectedVendor = '';
    this.selectedRfqStatus = '';
    this.selectedOutcome = '';
    this.selectedCurrency = '';
    this.searchTerm = '';
    this.sortBy = '';
    this.sortDirection = 'desc';
    this.applyFilters();
  }

  loadSummary(): void {
    this.reportsService.getBidAnalysisSummary(this.getFilterParams()).subscribe({
      next: (res) => {
        this.summary = res;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadCharts(): void {
    this.loadingCharts = true;
    this.reportsService.getBidAnalysisCharts(this.getFilterParams()).subscribe({
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

  updateCharts(charts: BidWinLossCharts): void {
    this.outcomeDonutChart = {
      ...this.outcomeDonutChart,
      series: charts.bidOutcomeDistribution.map(b => b.count),
      labels: charts.bidOutcomeDistribution.map(b => b.status)
    };

    this.winLossTrendChart = {
      ...this.winLossTrendChart,
      series: [
        { name: 'Won Quotes', data: charts.winLossTrend.map(t => t.wonCount) },
        { name: 'Lost Quotes', data: charts.winLossTrend.map(t => t.lostCount) }
      ],
      xaxis: { ...this.winLossTrendChart.xaxis, categories: charts.winLossTrend.map(t => t.period) }
    };
  }

  loadAllCountsAndActiveTable(page: number = 1): void {
    this.loadTable(page);
    const countParams = this.getFilterParams();
    countParams.pageNumber = 1;
    countParams.pageSize = 1;
    if (this.activeSection !== 'rfqs') {
      this.reportsService.getRfqAnalysisDetails(countParams).subscribe({
        next: (res) => { this.rfqsData.totalCount = res.totalCount; this.cdr.detectChanges(); },
        error: () => {}
      });
    } else {
      this.reportsService.getBidAnalysisDetails(countParams).subscribe({
        next: (res) => { this.bidsData.totalCount = res.totalCount; this.cdr.detectChanges(); },
        error: () => {}
      });
    }
  }

  switchSection(sec: 'bids' | 'rfqs'): void {
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

    if (this.activeSection === 'bids') {
      params.pageSize = this.bidsData.pageSize;
      this.reportsService.getBidAnalysisDetails(params).subscribe({
        next: (res) => { this.bidsData = res; this.loadingTable = false; this.cdr.detectChanges(); },
        error: () => { this.loadingTable = false; this.cdr.detectChanges(); }
      });
    } else {
      params.pageSize = this.rfqsData.pageSize;
      this.reportsService.getRfqAnalysisDetails(params).subscribe({
        next: (res) => { this.rfqsData = res; this.loadingTable = false; this.cdr.detectChanges(); },
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
    this.toastr.info('Generating Quote Win/Loss Analysis Report PDF...');
    const params = this.getFilterParams();

    this.reportsService.exportBidWinLossPdf(params, 'detailed').subscribe({
      next: (blob) => {
        this.exportingPdf = false;
        const filename = `Quote_Win_Loss_Analysis_Report_${params.preset || 'Report'}_${new Date().toISOString().slice(0, 10)}.pdf`;
        this.reportsService.downloadPdfBlob(blob, filename);
        this.toastr.success('Quote Win/Loss report downloaded successfully.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.exportingPdf = false;
        this.toastr.error('Failed to generate Quote Win/Loss Analysis Report PDF.');
        this.cdr.detectChanges();
      }
    });
  }

  get bidsPageQuotedTotal(): number { return this.bidsData.items.reduce((s, r) => s + r.quotedAmount, 0); }
  get rfqsPageWinningTotal(): number { return this.rfqsData.items.reduce((s, r) => s + r.winningBidAmount, 0); }

  get loggedInVendorLabel(): string {
    if (this.metadata?.vendors?.length === 1) return this.metadata.vendors[0].label;
    if (this.chartsData?.vendorPerformance?.length === 1) return this.chartsData.vendorPerformance[0].vendorName;
    return 'Authenticated Vendor Account';
  }

  toggleFilterBar(): void {
    this.showFilterBar = !this.showFilterBar;
  }

  goBack(): void {
    window.history.back();
  }

  getPages(): number[] {
    const data = this.activeSection === 'bids' ? this.bidsData : this.rfqsData;
    const totalPages = data?.totalPages || 1;
    const current = data?.pageNumber || 1;
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStatusChipClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'won' || s.includes('award') || s.includes('complete') || s.includes('delivered')) return 'chip chip--success';
    if (s === 'lost' || s.includes('reject') || s.includes('cancel')) return 'chip chip--rejected';
    if (s.includes('pending') || s.includes('evaluation')) return 'chip chip--pending';
    if (s.includes('open') || s.includes('progress') || s === 'new') return 'chip chip--approved';
    return 'chip chip--draft';
  }

  getOutcomePillClass(outcome: string): string {
    const o = (outcome || '').toLowerCase();
    if (o === 'won' || o.includes('complete') || o.includes('award')) return 'status-pill--success';
    if (o === 'lost' || o.includes('reject') || o.includes('cancel')) return 'status-pill--danger';
    if (o.includes('progress') || o === 'new') return 'status-pill--info';
    return 'status-pill--warning';
  }
}
