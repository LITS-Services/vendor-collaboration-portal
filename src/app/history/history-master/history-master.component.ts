import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

interface BidHistoryRow {
  bidId: string;
  rfqNo: string;
  vendorName: string;
  bidAmount: number;
  totalBids: number;
  statusLabel: string;
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
    totalRfqs: 549,
    totalItemsSold: 600,
    totalPurchaseOrders: 600,
    poSuccessPercent: 75,
    poRejectedPercent: 45,
      poSuccessCount: 745,
  poRejectedCount: 149
  };

  // Recent bids history (dummy)
  recentBids: BidHistoryRow[] = [
    {
      bidId: 'BID-10231',
      rfqNo: 'RFQ-8891',
      vendorName: 'Alpha Traders',
      bidAmount: 12500,
      totalBids: 12,
      statusLabel: 'Successful',
      statusKey: 'success',
    },
    {
      bidId: 'BID-10232',
      rfqNo: 'RFQ-8891',
      vendorName: 'Nova Supplies',
      bidAmount: 11950,
      totalBids: 5,
      statusLabel: 'Pending finalization',
      statusKey: 'pending',
    },
    {
      bidId: 'BID-10233',
      rfqNo: 'RFQ-8891',
      vendorName: 'CoreTech Ltd',
      bidAmount: 12300,
      totalBids: 3,
      statusLabel: 'Pending finalization',
      statusKey: 'pending',
    },
    {
      bidId: 'BID-10234',
      rfqNo: 'RFQ-9024',
      vendorName: 'Prime Vendors',
      bidAmount: 8200,
      totalBids: 8,
      statusLabel: 'Successful',
      statusKey: 'success',
    },
    {
      bidId: 'BID-10235',
      rfqNo: 'RFQ-9024',
      vendorName: 'Vertex Solutions',
      bidAmount: 7980,
      totalBids: 6,
      statusLabel: 'Successful',
      statusKey: 'success',
    },
    {
      bidId: 'BID-10236',
      rfqNo: 'RFQ-9024',
      vendorName: 'OmniTrade',
      bidAmount: 8450,
      totalBids: 5,
      statusLabel: 'Rejected',
      statusKey: 'rejected',
    },
  ];

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
  ngOnInit(): void {
    this.buildVendorRatingRadial();
    this.buildStars();
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
  }


  buildStars(): void {
    const rating = this.vendorAverageRating;
  
    const full = Math.round(rating);
    const empty = 5 - full;
  
    this.fullStars = Array(full).fill(0);
    this.halfStars = [];     // no half stars
    this.emptyStars = Array(empty).fill(0);
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
    console.log('View all bids clicked');
  }

  viewAllInvoices(): void {
    console.log('View all invoices clicked');
  }

  viewAllVendors(): void {
    console.log('View all vendors clicked');
  }
}
