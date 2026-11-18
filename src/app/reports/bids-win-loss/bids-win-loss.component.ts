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

  // Exhibit 1.1: Monthly Won vs Lost Bids Trend
  winLossTrendChart: ChartOptions = {
    series: [],
    chart: { type: 'line', height: 225, toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2.2 },
    colors: ['#16a34a', '#dc2626'],
    dataLabels: { enabled: false },
    xaxis: { categories: [], labels: { style: { colors: '#64748b', fontSize: '10.5px' } } },
    yaxis: { labels: { style: { colors: '#64748b', fontSize: '10.5px' } } },
    grid: { strokeDashArray: 3, borderColor: '#e2e8f0' },
    legend: { position: 'top', horizontalAlign: 'right', fontWeight: 600, fontSize: '11px' }
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
    return { items: [], totalCount: 0, pageNumber: 1, pageSize: 15, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
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

  getOutcomePillClass(outcome: string): string {
    const o = (outcome || '').toLowerCase();
    if (o === 'won' || o.includes('complete') || o.includes('award')) return 'status-pill--success';
    if (o === 'lost' || o.includes('reject') || o.includes('cancel')) return 'status-pill--danger';
    if (o.includes('progress') || o === 'new') return 'status-pill--info';
    return 'status-pill--warning';
  }
}
