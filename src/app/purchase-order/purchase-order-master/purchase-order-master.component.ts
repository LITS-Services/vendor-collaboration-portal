import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';
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
import { ChartEvent, ChartType } from 'ng-chartist';
const data: any = require('../../shared/data/chartist.json');
export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  colors: string[],
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[],
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels,
  stroke: ApexStroke,
  grid: ApexGrid,
  legend?: ApexLegend,
  tooltip?: ApexTooltip,
  plotOptions?: ApexPlotOptions,
  labels?: string[],
  fill: ApexFill,
  markers?: ApexMarkers,
  theme: ApexTheme,
  responsive: ApexResponsive[]
};

var $info = "#249D57",
  $info_light = "#BDE2CD"
var themeColors = [$info, $info_light];
export interface Chart {
  type: ChartType;
  data: Chartist.IChartistData;
  options?: any;
  responsiveOptions?: any;
  events?: ChartEvent;
  // plugins?: any;
}

export interface PurchaseOrdersCountVM {
  totalPurchaseOrders: number;
  awardedPurchaseOrders: number;
  rejectedPurchaseOrders: number;
  deliveredPurchaseOrders: number;
}

@Component({
  selector: 'app-purchase-order-master',
  templateUrl: './purchase-order-master.component.html',
  styleUrls: ['./purchase-order-master.component.scss']
})
export class PurchaseOrderMasterComponent implements OnInit {

  poCounts!: PurchaseOrdersCountVM;

  columnChartOptions: Partial<ChartOptions>;
  DonutChart: Chart = {
    type: 'Pie',
    data: data['donutDashboard'],
    options: {
      donut: true,
      startAngle: 0,
      labelInterpolationFnc: function (value) {
        var total = data['donutDashboard'].series.reduce(function (prev, series) {
          return prev + series.value;
        }, 0);
        return total + '%';
      }
    },
    events: {
      draw(data: any): void {
        if (data.type === 'label') {
          if (data.index === 0) {
            data.element.attr({
              dx: data.element.root().width() / 2,
              dy: data.element.root().height() / 2
            });
          } else {
            data.element.remove();
          }
        }

      }
    }
  };

  constructor(private router: Router,
    private purchaseOrderService: PurchaseOrderService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal) {
    this.columnChartOptions = {
      chart: {
        height: 350,
        type: 'bar',
        toolbar: {
          show: false
        },
        animations: {
          enabled: false
        }
      },
      colors: themeColors,
      plotOptions: {
        bar: {
          horizontal: false,
          endingShape: 'rounded',
          columnWidth: '25%',
        },
      },
      grid: {
        borderColor: "#BDBDBD44"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      series: [{
        name: 'Net Profit',
        data: [40, 50, 110, 90, 85, 115, 100, 90]
      }, {
        name: 'Revenue',
        data: [30, 40, 100, 80, 75, 105, 90, 80]
      }],
      legend: {
        show: false
      },
      xaxis: {
        categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        axisBorder: {
          color: "#BDBDBD44"
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "$" + val + " thousands"
          }
        }
      }
    }
  }

  ngOnInit(): void {
    this.loadPurchaseOrdersCount();
  }
  onResized(event: any) {
    setTimeout(() => {
      this.fireRefreshEventOnWindow();
    }, 300);
  }

  loadPurchaseOrdersCount(): void {
    const userId = localStorage.getItem('userId');
    this.purchaseOrderService.getPurchaseOrdersCount(userId).subscribe({
      next: (data) => {
        this.poCounts = data;
      },
      error: (err) => {
        console.error('Error fetching purchase orders count:', err);
      }
    });
    this.cdr.detectChanges();
  }
  newrfq() {
    this.router.navigate(['/purchase-order/new-purchase-order'], {
      queryParams: { title: 'New Request For Quotation' }
    });
  }

  navigateToStatus(status: string | null) {
    // Always update query params, omit 'status' if null for Total
    const queryParams = status ? { status } : {};
    this.router.navigate(['/purchase-order/purchase-order-list'], { queryParams });
  }

  purchaseOrderList(title: string, status?: string) {
    this.router.navigate(['/purchase-order/purchase-order-list'], {
      queryParams: {
        title: title,
        status: status || ''
      },
      skipLocationChange: true
    });
  }
  fireRefreshEventOnWindow = function () {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("resize", true, false);
    window.dispatchEvent(evt);
  };
}
