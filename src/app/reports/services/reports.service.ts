import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface ReportFilterParams {
  preset?: string;
  fromDate?: string;
  toDate?: string;
  vendorUserId?: string;
  status?: string;
  currency?: string;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface SalesReportSummary {
  totalSales: number;
  totalSalesPrevious: number;
  salesGrowthPercentage: number | null;
  totalPurchaseOrders: number;
  totalPurchaseOrdersPrevious: number;
  poGrowthPercentage: number | null;
  totalShipments: number;
  totalShipmentsPrevious: number;
  shipmentGrowthPercentage: number | null;
  deliveredShipments: number;
  deliveredShipmentsPrevious: number;
  deliveredGrowthPercentage: number | null;
  totalInvoicedAmount: number;
  totalInvoicedPrevious: number;
  invoicedGrowthPercentage: number | null;
  outstandingInvoiceAmount: number;
  outstandingPrevious: number;
  outstandingGrowthPercentage: number | null;
  approvedForPaymentAmount: number;
  approvedPrevious: number;
  approvedGrowthPercentage: number | null;
  totalPaidAmount: number;
  totalPaidPrevious: number;
  paidGrowthPercentage: number | null;
  pendingInvoiceAmount: number;
  pendingPrevious: number;
  pendingGrowthPercentage: number | null;
  currency: string;
  periodLabel: string;
  previousPeriodLabel: string;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
  amount: number;
  percentage: number;
  color: string;
}

export interface SalesTrendPoint {
  period: string;
  currentSales: number;
  previousSales: number;
}

export interface PaymentAnalysis {
  paidAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  outstandingAmount: number;
  totalInvoicedAmount: number;
}

export interface VendorSalesContribution {
  vendorId: string;
  vendorName: string;
  totalSales: number;
  poCount: number;
  percentageContribution: number;
}

export interface SalesReportCharts {
  salesTrend: SalesTrendPoint[];
  poStatusDistribution: StatusDistributionItem[];
  shipmentStatusDistribution: StatusDistributionItem[];
  invoiceStatusDistribution: StatusDistributionItem[];
  paymentAnalysis: PaymentAnalysis;
  topVendors: VendorSalesContribution[];
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SalesPurchaseOrderRow {
  id: number;
  purchaseOrderNo: string;
  vendorName: string;
  poDate: string;
  totalAmount: number;
  currency: string;
  poStatus: string;
  shipmentStatus: string;
  invoiceCount: number;
  invoicedAmount: number;
}

export interface SalesShipmentRow {
  id: number;
  shipmentNumber: string;
  purchaseOrderNo: string;
  purchaseOrderId: number;
  vendorName: string;
  shipmentDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate: string | null;
  shipmentStatus: string;
  shipmentValue: number;
}

export interface SalesInvoiceRow {
  id: number;
  invoiceNumber: string;
  purchaseOrderNo: string;
  purchaseOrderId?: number;
  vendorName: string;
  invoiceDate: string;
  dueDate: string;
  invoiceAmount: number;
  currency: string;
  invoiceStatus: string;
  paymentStatus: string;
  paidAmount: number;
  outstandingAmount: number;
}

export interface SalesPaymentRow {
  id: number;
  paymentReference: string;
  invoiceNumber: string;
  invoiceId?: number;
  vendorName: string;
  paymentDate: string;
  paymentAmount: number;
  paymentStatus: string;
  paymentMethod: string;
}

// Bids Win/Loss Interfaces
export interface BidAnalysisSummary {
  totalRfqs: number;
  totalRfqsPrevious: number;
  rfqGrowthPercentage: number | null;
  rfqsWithBids: number;
  rfqsWithBidsPrevious: number;
  totalBidsReceived: number;
  totalBidsPrevious: number;
  bidsGrowthPercentage: number | null;
  wonBids: number;
  wonBidsPrevious: number;
  lostBids: number;
  lostBidsPrevious: number;
  pendingBids: number;
  pendingBidsPrevious: number;
  winRate: number;
  winRatePrevious: number;
  winRateGrowthPercentage: number | null;
  lossRate: number;
  lossRatePrevious: number;
  totalWonBidValue: number;
  totalWonBidValuePrevious: number;
  totalLostBidValue: number;
  totalLostBidValuePrevious: number;
  rfqToPoConversionRate: number;
  rfqToPoConversionRatePrevious: number;
  currency: string;
  periodLabel: string;
  previousPeriodLabel: string;
}

export interface BidTrendPoint {
  period: string;
  wonCount: number;
  lostCount: number;
  pendingCount: number;
  wonValue: number;
  lostValue: number;
}

export interface VendorBidPerformance {
  vendorId: string;
  vendorName: string;
  totalBids: number;
  wonBids: number;
  lostBids: number;
  pendingBids: number;
  winRate: number;
  lossRate: number;
  totalWonValue: number;
  totalLostValue: number;
}

export interface RfqParticipationAnalysis {
  rfqsPublished: number;
  rfqsReceivingBids: number;
  rfqsWithoutBids: number;
  rfqsAwarded: number;
}

export interface BidWinLossCharts {
  bidOutcomeDistribution: StatusDistributionItem[];
  winLossTrend: BidTrendPoint[];
  vendorPerformance: VendorBidPerformance[];
  rfqParticipation: RfqParticipationAnalysis;
  bidValueTrend: BidTrendPoint[];
  topVendorsByWinRate: VendorBidPerformance[];
}

export interface BidAnalysisRow {
  id: number;
  rfqNumber: string;
  rfqTitle: string;
  rfqPublishedDate: string;
  vendorName: string;
  bidSubmissionDate: string;
  quotedAmount: number;
  currency: string;
  bidOutcome: string;
  awardedVendor: string;
  poNumber: string;
  quotationRequestId?: number;
}

export interface RfqSummaryRow {
  id: number;
  rfqNumber: string;
  rfqTitle: string;
  rfqDate: string;
  participatingVendorsCount: number;
  totalBidsReceived: number;
  winningVendor: string;
  winningBidAmount: number;
  rfqStatus: string;
  poNumber: string;
  awardDate: string | null;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface ReportsFilterMetadata {
  vendors: FilterOption[];
  poStatuses: FilterOption[];
  shipmentStatuses: FilterOption[];
  invoiceStatuses: FilterOption[];
  rfqStatuses: FilterOption[];
  currencies: FilterOption[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) {}

  private buildParams(filter: ReportFilterParams): HttpParams {
    let params = new HttpParams();
    if (filter.preset) params = params.set('preset', filter.preset);
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter.toDate) params = params.set('toDate', filter.toDate);
    if (filter.vendorUserId) params = params.set('vendorUserId', filter.vendorUserId);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.currency) params = params.set('currency', filter.currency);
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);
    if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    return params;
  }

  // ===================== Sales Report =====================
  getSalesReportSummary(filter: ReportFilterParams): Observable<SalesReportSummary> {
    return this.http.get<SalesReportSummary>(`${this.baseUrl}/sales/summary`, {
      params: this.buildParams(filter)
    });
  }

  getSalesReportCharts(filter: ReportFilterParams): Observable<SalesReportCharts> {
    return this.http.get<SalesReportCharts>(`${this.baseUrl}/sales/charts`, {
      params: this.buildParams(filter)
    });
  }

  getSalesPurchaseOrders(filter: ReportFilterParams): Observable<PaginatedResult<SalesPurchaseOrderRow>> {
    return this.http.get<PaginatedResult<SalesPurchaseOrderRow>>(`${this.baseUrl}/sales/purchase-orders`, {
      params: this.buildParams(filter)
    });
  }

  getSalesShipments(filter: ReportFilterParams): Observable<PaginatedResult<SalesShipmentRow>> {
    return this.http.get<PaginatedResult<SalesShipmentRow>>(`${this.baseUrl}/sales/shipments`, {
      params: this.buildParams(filter)
    });
  }

  getSalesInvoices(filter: ReportFilterParams): Observable<PaginatedResult<SalesInvoiceRow>> {
    return this.http.get<PaginatedResult<SalesInvoiceRow>>(`${this.baseUrl}/sales/invoices`, {
      params: this.buildParams(filter)
    });
  }

  getSalesPayments(filter: ReportFilterParams): Observable<PaginatedResult<SalesPaymentRow>> {
    return this.http.get<PaginatedResult<SalesPaymentRow>>(`${this.baseUrl}/sales/payments`, {
      params: this.buildParams(filter)
    });
  }

  exportSalesReportPdf(filter: ReportFilterParams, reportType: string = 'summary'): Observable<Blob> {
    let params = this.buildParams(filter);
    params = params.set('reportType', reportType);
    return this.http.get(`${this.baseUrl}/sales/export-pdf`, {
      params,
      responseType: 'blob'
    });
  }

  // ===================== Bids Win/Loss Analysis =====================
  getBidAnalysisSummary(filter: ReportFilterParams): Observable<BidAnalysisSummary> {
    return this.http.get<BidAnalysisSummary>(`${this.baseUrl}/bids-win-loss/summary`, {
      params: this.buildParams(filter)
    });
  }

  getBidAnalysisCharts(filter: ReportFilterParams): Observable<BidWinLossCharts> {
    return this.http.get<BidWinLossCharts>(`${this.baseUrl}/bids-win-loss/charts`, {
      params: this.buildParams(filter)
    });
  }

  getBidAnalysisDetails(filter: ReportFilterParams): Observable<PaginatedResult<BidAnalysisRow>> {
    return this.http.get<PaginatedResult<BidAnalysisRow>>(`${this.baseUrl}/bids-win-loss/bids`, {
      params: this.buildParams(filter)
    });
  }

  getVendorBidPerformance(filter: ReportFilterParams): Observable<PaginatedResult<VendorBidPerformance>> {
    return this.http.get<PaginatedResult<VendorBidPerformance>>(`${this.baseUrl}/bids-win-loss/vendor-performance`, {
      params: this.buildParams(filter)
    });
  }

  getRfqAnalysisDetails(filter: ReportFilterParams): Observable<PaginatedResult<RfqSummaryRow>> {
    return this.http.get<PaginatedResult<RfqSummaryRow>>(`${this.baseUrl}/bids-win-loss/rfq-summary`, {
      params: this.buildParams(filter)
    });
  }

  exportBidWinLossPdf(filter: ReportFilterParams, reportType: string = 'summary'): Observable<Blob> {
    let params = this.buildParams(filter);
    params = params.set('reportType', reportType);
    return this.http.get(`${this.baseUrl}/bids-win-loss/export-pdf`, {
      params,
      responseType: 'blob'
    });
  }

  // ===================== Metadata =====================
  getFiltersMetadata(): Observable<ReportsFilterMetadata> {
    return this.http.get<ReportsFilterMetadata>(`${this.baseUrl}/filters-metadata`);
  }

  // ===================== Download Helper =====================
  downloadPdfBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
