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
  invoices: InvoiceRow[] = [
    {
      invoiceNo: 'INV-198',
      vendor: 'Global Supplier Inc.',
      amount: 1380,
      statusLabel: 'Paid',
      statusKey: 'paid',
      dueDate: '2025-12-20',
    },
    {
      invoiceNo: 'INV-201',
      vendor: 'Tech Solution Ltd.',
      amount: 2000,
      statusLabel: 'Pending',
      statusKey: 'pending',
      dueDate: '2025-12-26',
    },
    {
      invoiceNo: 'INV-302',
      vendor: 'Innovate Corp.',
      amount: 1257,
      statusLabel: 'Paid',
      statusKey: 'paid',
      dueDate: '2025-12-28',
    },
    {
      invoiceNo: 'INV-504',
      vendor: 'Future System',
      amount: 1500,
      statusLabel: 'Pending',
      statusKey: 'pending',
      dueDate: '2025-12-31',
    },
    {
      invoiceNo: 'INV-607',
      vendor: 'Industrial Printer',
      amount: 1500,
      statusLabel: 'Pending',
      statusKey: 'pending',
      dueDate: '2025-12-31',
    },
  ];

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

  private mapStatusKey(status: string): 'success' | 'pending' | 'rejected' {
    const s = status?.toLowerCase();

    if (s === 'completed' || s === 'successful' || s === 'accepted')
      return 'success';

    if (s === 'rejected')
      return 'rejected';

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
    console.log('View all invoices clicked');
  }

  viewAllVendors(): void {
    console.log('View all vendors clicked');
  }
}