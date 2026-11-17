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
  BidAnalysisSummary,
  BidWinLossCharts,
  BidAnalysisRow,
  VendorBidPerformance,
  RfqSummaryRow,
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

  activeTab: 'bids' | 'vendors' | 'rfqs' = 'bids';

  bidsData: PaginatedResult<BidAnalysisRow> = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
  vendorsData: PaginatedResult<VendorBidPerformance> = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
  rfqsData: PaginatedResult<RfqSummaryRow> = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false };

  searchTerm: string = '';
  sortBy: string = '';
  sortDirection: 'asc' | 'desc' = 'desc';

  loadingSummary = false;
  loadingCharts = false;
  loadingTable = false;
  exportingPdf = false;

  // 1. Outcome Donut
  outcomeDonutChart: ChartOptions = {
    series: [],
    chart: { type: 'donut', height: 270 },
    labels: ['Won', 'Lost', 'Pending'],
    colors: ['#22c55e', '#ef4444', '#f59e0b'],
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
              label: 'Total Bids',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              formatter: () => `${this.summary?.totalBidsReceived ?? 0}`
            }
          }
        }
      }
    }
  };

  // 2. Win / Loss Trend Line
  winLossTrendChart: ChartOptions = {
    series: [],
    chart: { type: 'line', height: 280, toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2.5 },
    colors: ['#22c55e', '#ef4444'],
    dataLabels: { enabled: false },
    xaxis: { categories: [], labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    yaxis: { labels: { style: { colors: '#64748b' } } },
    grid: { strokeDashArray: 4, borderColor: '#f1f5f9' },
    legend: { position: 'top', horizontalAlign: 'right' }
  };

  // 3. Vendor Win/Loss Performance Stacked Bar
  vendorPerfChart: ChartOptions = {
    series: [],
    chart: { type: 'bar', height: 280, stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 3 } },
    colors: ['#22c55e', '#ef4444'],
    dataLabels: { enabled: false },
    xaxis: { categories: [] },
    legend: { position: 'top', horizontalAlign: 'right' },
    grid: { strokeDashArray: 4, borderColor: '#f1f5f9' }
  };

  // 4. RFQ Participation Bar
  rfqParticipationChart: ChartOptions = {
    series: [],
    chart: { type: 'bar', height: 270, toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '45%', distributed: true, borderRadius: 4 } },
    colors: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'],
    dataLabels: { enabled: false },
    xaxis: { categories: ['Published', 'With Bids', 'No Bids', 'Awarded'], labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    legend: { show: false },
    grid: { strokeDashArray: 4, borderColor: '#f1f5f9' }
  };

  // 5. Bid Value Analysis
  bidValueTrendChart: ChartOptions = {
    series: [],
    chart: { type: 'bar', height: 280, stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '40%', borderRadius: 4 } },
    colors: ['#22c55e', '#ef4444'],
    dataLabels: { enabled: false },
    xaxis: { categories: [] },
    yaxis: { labels: { formatter: (val: any) => `${Number(val) >= 1000 ? (Number(val) / 1000).toFixed(0) + 'k' : Number(val).toFixed(0)}` } },
    legend: { position: 'top', horizontalAlign: 'right' },
    grid: { strokeDashArray: 4, borderColor: '#f1f5f9' },
    tooltip: { y: { formatter: (val: any) => `${(Number(val) || 0).toLocaleString()} SAR` } }
  };

  // 6. Vendor Win Rate Ranking
  vendorWinRateChart: ChartOptions = {
    series: [],
    chart: { type: 'bar', height: 270, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, barHeight: '50%', borderRadius: 4 } },
    colors: ['#249d57'],
    dataLabels: { enabled: true, formatter: (val: any) => `${val}%`, style: { fontSize: '10px' } },
    xaxis: { categories: [], max: 100, labels: { formatter: (val: any) => `${val}%` } },
    grid: { strokeDashArray: 4, borderColor: '#f1f5f9' }
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
    this.loadingSummary = true;
    this.reportsService.getBidAnalysisSummary(this.getFilterParams()).subscribe({
      next: (res) => {
        this.summary = res;
        this.loadingSummary = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingSummary = false;
        this.toastr.error('Failed to load bid analysis summary.');
        this.cdr.detectChanges();
      }
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
    // 1. Outcome Donut
    this.outcomeDonutChart = {
      ...this.outcomeDonutChart,
      series: charts.bidOutcomeDistribution.map(b => b.count),
      labels: charts.bidOutcomeDistribution.map(b => b.status)
    };

    // 2. Win / Loss Trend
    this.winLossTrendChart = {
      ...this.winLossTrendChart,
      series: [
        { name: 'Won Bids', data: charts.winLossTrend.map(t => t.wonCount) },
        { name: 'Lost Bids', data: charts.winLossTrend.map(t => t.lostCount) }
      ],
      xaxis: { ...this.winLossTrendChart.xaxis, categories: charts.winLossTrend.map(t => t.period) }
    };

    // 3. Vendor Performance Stacked Bar
    this.vendorPerfChart = {
      ...this.vendorPerfChart,
      series: [
        { name: 'Won Bids', data: charts.vendorPerformance.map(v => v.wonBids) },
        { name: 'Lost Bids', data: charts.vendorPerformance.map(v => v.lostBids) }
      ],
      xaxis: { categories: charts.vendorPerformance.map(v => v.vendorName) }
    };

    // 4. RFQ Participation
    this.rfqParticipationChart = {
      ...this.rfqParticipationChart,
      series: [{
        name: 'RFQs',
        data: [
          charts.rfqParticipation.rfqsPublished,
          charts.rfqParticipation.rfqsReceivingBids,
          charts.rfqParticipation.rfqsWithoutBids,
          charts.rfqParticipation.rfqsAwarded
        ]
      }]
    };

    // 5. Bid Value Analysis
    this.bidValueTrendChart = {
      ...this.bidValueTrendChart,
      series: [
        { name: 'Won Value (SAR)', data: charts.bidValueTrend.map(v => v.wonValue) },
        { name: 'Lost Value (SAR)', data: charts.bidValueTrend.map(v => v.lostValue) }
      ],
      xaxis: { categories: charts.bidValueTrend.map(v => v.period) }
    };

    // 6. Vendor Win Rate Ranking
    const rankedVendors = charts.topVendorsByWinRate.slice(0, 8);
    this.vendorWinRateChart = {
      ...this.vendorWinRateChart,
      series: [{ name: 'Win Rate (%)', data: rankedVendors.map(v => v.winRate) }],
      xaxis: { ...this.vendorWinRateChart.xaxis, categories: rankedVendors.map(v => `${v.vendorName} (${v.totalBids})`) }
    };
  }

  switchTab(tab: 'bids' | 'vendors' | 'rfqs'): void {
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

    if (this.activeTab === 'bids') {
      params.pageSize = this.bidsData.pageSize;
      this.reportsService.getBidAnalysisDetails(params).subscribe({
        next: (res) => { this.bidsData = res; this.loadingTable = false; this.cdr.detectChanges(); },
        error: () => { this.loadingTable = false; this.cdr.detectChanges(); }
      });
    } else if (this.activeTab === 'vendors') {
      params.pageSize = this.vendorsData.pageSize;
      this.reportsService.getVendorBidPerformance(params).subscribe({
        next: (res) => { this.vendorsData = res; this.loadingTable = false; this.cdr.detectChanges(); },
        error: () => { this.loadingTable = false; this.cdr.detectChanges(); }
      });
    } else if (this.activeTab === 'rfqs') {
      params.pageSize = this.rfqsData.pageSize;
      this.reportsService.getRfqAnalysisDetails(params).subscribe({
        next: (res) => { this.rfqsData = res; this.loadingTable = false; this.cdr.detectChanges(); },
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

  drillDownToOutcome(outcome: string): void {
    this.activeTab = 'bids';
    this.selectedOutcome = outcome;
    this.loadTableData(1);

    const el = document.getElementById('details-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  exportPdf(type: 'summary' | 'detailed'): void {
    this.exportingPdf = true;
    this.toastr.info(`Preparing ${type === 'summary' ? 'Summary' : 'Detailed'} PDF...`);
    const params = this.getFilterParams();

    this.reportsService.exportBidWinLossPdf(params, type).subscribe({
      next: (blob) => {
        this.exportingPdf = false;
        const filename = `BidsWinLossReport_${type}_${params.preset || 'report'}_${new Date().toISOString().slice(0, 10)}.pdf`;
        this.reportsService.downloadPdfBlob(blob, filename);
        this.toastr.success('Bids report downloaded successfully.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.exportingPdf = false;
        this.toastr.error('Failed to generate PDF report.');
        this.cdr.detectChanges();
      }
    });
  }

  viewRfq(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/rfq/rfq-details', id]);
    }
  }

  getOutcomeBadge(outcome: string): string {
    const o = (outcome || '').toLowerCase();
    if (o === 'won') return 'badge-success';
    if (o === 'lost') return 'badge-danger';
    return 'badge-warning';
  }
}
