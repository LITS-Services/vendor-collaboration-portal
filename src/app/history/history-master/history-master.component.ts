import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'app/shared/auth/auth.service';
import { DashboardService } from 'app/shared/services/dashboard.service';
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

export interface VendorDashboardHistoryVM {
  totalRFQs: number;
  totalAcceptedQuantity: number;
  totalPurchaseOrders: number;
  successfulOrders: number;
  rejectedOrders: number;
  averageVendorRating: number;
}

export interface RecentVendorBidsHistoryVM {
  itemCode: string;
  rfqNo: string;
  biddingAmount: number;
  endDate: string | null;   // ISO string
  status: string;
  statusKey: 'success' | 'pending' | 'rejected';
}

export interface VendorDashboardAndHistoryInvoicesVM
{
  invoiceNo: string;
  purchaseOrderNo: string;
  entityName: string;
  totalAmount: number;
  status: string;
  dueDate: Date;
  statusKey: 'paid' | 'pending for payment';
}

interface InvoiceRow {
  invoiceNo: string;
  vendor: string;
  amount: number;
  statusLabel: string;
  statusKey: 'paid' | 'pending';
  dueDate: string; // ISO date
}

interface VendorRating {
  initials: string;
  name: string;
  orders: number;
  rating: number;
  isActive?: boolean;
}

@Component({
  selector: 'app-history-master',
  templateUrl: './history-master.component.html',
  styleUrls: ['./history-master.component.scss'],
  standalone: false
})
export class HistoryMasterComponent implements OnInit {

  metrics = {
    totalRfqs: 0,
    totalItemsSold: 0,
    totalPurchaseOrders: 0,
    poSuccessCount: 0,
    poRejectedCount: 0
  };

  recentBids: RecentVendorBidsHistoryVM[] = [];

  // Purchase order invoice list (dummy)
  vendorDashboardAndHistoryInvoices: VendorDashboardAndHistoryInvoicesVM[] = [];

  // Vendor ratings (dummy)
  vendors: VendorRating[] = [
    { initials: 'GS', name: 'Global Supplier Inc.', orders: 127, rating: 4.9, isActive: true },
    { initials: 'TS', name: 'Tech Solution Ltd.', orders: 127, rating: 4.7 },
    { initials: 'IC', name: 'Innovate Corp.', orders: 127, rating: 4.8 },
    { initials: 'FS', name: 'Future System', orders: 127, rating: 4.5 },
    { initials: 'IP', name: 'Industrial Printer', orders: 127, rating: 4.6 },
  ];
  poSuccessRadial: any;
  poRejectedRadial: any;

  vendorAverageRating = 3.9;     
  vendorRatingRadial: any;

  fullStars: number[] = [];
  halfStars: number[] = [];
  emptyStars: number[] = [];
  starsArr = [1, 2, 3, 4, 5];

  constructor(private dashboardService: DashboardService, private authService: AuthService,
    private cdr: ChangeDetectorRef, private router: Router
  ) { }
  ngOnInit(): void {
    this.buildVendorRatingRadial();
    this.buildStars();
    this.loadVendorDashboardHistory();
    this.loadRecentBids();
    this.loadVendorDashboardAndHistoryInvoices();
  }

  loadVendorDashboardHistory(): void {
    const vendorId = this.authService.getUserId();

    this.dashboardService.getVendorDashboardHistory(vendorId)
      .subscribe(res => {

        const data = res; // Ardalis.Result => value

        this.metrics.totalRfqs = data.totalRFQs;
        this.metrics.totalItemsSold = data.totalAcceptedQuantity;
        this.metrics.totalPurchaseOrders = data.totalPurchaseOrders;
        this.metrics.poSuccessCount = data.successfulOrders;
        this.metrics.poRejectedCount = data.rejectedOrders;

        this.vendorAverageRating = data.averageVendorRating;

        this.cdr.detectChanges();

        this.buildVendorRatingRadial();
        this.buildStars();
      });
  }


  buildVendorRatingRadial(): void {

    const pct = (this.vendorAverageRating / 5) * 100;

    this.vendorRatingRadial = {
      series: [pct],
      chart: {
        type: 'radialBar',
        height: 220,
        width: '100%',
        sparkline: { enabled: true },
        toolbar: { show: false },
        animations: { enabled: false }
      },
      colors: ['#249D57'], // green
      plotOptions: {
        radialBar: {
          startAngle: 0,
          endAngle: 360,
          hollow: {
            size: '82%',
            background: '#ffffff'
          },
          track: {
            background: '#e5f7ec', // soft green track
            strokeWidth: '100%',
            margin: 0
          },
          dataLabels: {
            name: { show: false },
            value: { show: false } // we show our own in the center
          }
        }
      },
      stroke: {
        lineCap: 'round'
      },
      fill: { type: 'solid' },
      tooltip: { enabled: false }
    };

    this.cdr.detectChanges();
  }


  buildStars(): void {
    const rating = this.vendorAverageRating;

    const full = Math.round(rating);
    const empty = 5 - full;

    this.fullStars = Array(full).fill(0);
    this.halfStars = [];     // no half stars
    this.emptyStars = Array(empty).fill(0);

    this.cdr.detectChanges();
  }

  getVendorRatingLabel(): string {
    const rating = this.vendorAverageRating;

    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.0) return 'Good';
    if (rating >= 2.0) return 'Fair';
    if (rating > 0) return 'Poor';
    return 'No Rating';
  }


  loadRecentBids(): void {
    const vendorId = this.authService.getUserId();

    this.dashboardService.getRecentVendorBidsHistory(vendorId)
      .subscribe(res => {

        const rows = res;

        this.recentBids = rows.map(r => ({
          itemCode: r.itemCode,
          rfqNo: r.rfqNo,
          biddingAmount: r.biddingAmount,
          endDate: r.endDate,
          status: r.status,
          statusKey: this.mapStatusKey(r.status)
        }));
        this.cdr.detectChanges();
      });
  }

  loadVendorDashboardAndHistoryInvoices(): void {
    const vendorId = this.authService.getUserId();
    const onlyPending = false;
    this.dashboardService.getVendorDashboardAndHistoryInvoices(vendorId, onlyPending)
      .subscribe(res => {

        const rows = res;

        this.vendorDashboardAndHistoryInvoices = rows.map(r => ({
          invoiceNo: r.invoiceNo,
          purchaseOrderNo: r.purchaseOrderNo,
          entityName: r.entityName,
          totalAmount: r.totalAmount,
          status: r.status,
          dueDate: r.dueDate,
          statusKey: this.mapStatusKey(r.status)
        }));
        this.cdr.detectChanges();
      });
  }

  private mapStatusKey(status: string): 'success' | 'pending' | 'rejected' | 'pending for payment' | 'paid'{
    const s = status?.toLowerCase();

    if (s === 'completed' || s === 'successful' || s === 'accepted'  || s === 'paid')
      return 'success';

    if (s === 'rejected')
      return 'rejected';

    if (s === 'pending for payment' || s === 'pending')
    return 'pending';
  }

  formatNumber(value: number | null | undefined): string {
    if (value == null) return '0';
    return value.toLocaleString('en-US');
  }

  formatCurrency(value: number | null | undefined): string {
    if (value == null) return '0';
    return value.toLocaleString('en-US', {
      maximumFractionDigits: 0,
    });
  }

  // View all handlers (you can wire these later)
  viewAllBids(): void {
    // TODO: route/navigation
    this.router.navigate(['/rfq/rfq-list']);
  }

  viewAllSoldItems(): void {
    // TODO: route/navigation
    this.router.navigate(['/purchase-order/purchase-order-list']);
  }

  viewAllInvoices(): void {
    this.router.navigate(['/invoices/invoice-list']);
  }

  viewAllVendors(): void {
    console.log('View all vendors clicked');
  }
}