import { RouteInfo } from '../vertical-menu/vertical-menu.metadata';

export const HROUTES: RouteInfo[] = [

  // {
  //   path: '/dashboard/dashboard1', title: 'Dashboard', icon: 'ft-home', class: '', isExternalLink: false,
  //   submenu: [  
  //   ]
  // },

   { path: '/dashboard/dashboard1', title: 'Dashboard', icon: 'ft-briefcase',class: '', isExternalLink: false, permission: 'rfq.view', submenu: [
   ] },
  { path: '/company', title: 'Companies', icon: 'ft-briefcase',class: '', isExternalLink: false, permission: 'vendor-companies.view', submenu: [
  ] },
  { path: '/rfq', title: 'RFQ', icon: 'fa fa-handshake-o',class: '', isExternalLink: false, permission: 'rfq.view', submenu: [
  ] },
  { path: '/purchase-order', title: 'POs', icon: 'ft-shopping-cart', class: '', badge: '', badgeClass: '', isExternalLink: false, permission: 'purchase-order.view', submenu: [] },
  { path: '/invoices', title: 'Invoices', icon: 'ft-invoice',class: '', isExternalLink: false, permission: 'purchase-order.view', submenu: [
  ] },
  { 
    path: '/reports', 
    title: 'Reports', 
    icon: 'ft-file-text', 
    class: 'dropdown nav-item', 
    isExternalLink: false, 
    submenu: [
      { path: '/reports/sales-report', title: 'Sales Report', icon: 'assets/img/sidebar-icons/childmenu-icons/Sales Report_icon.svg', class: 'dropdown-item', isExternalLink: false, submenu: [] },
      { path: '/reports/bids-win-loss-report', title: 'Quote Win/Loss Analysis Report', icon: 'assets/img/sidebar-icons/childmenu-icons/Quote Win Loss_icon.svg', class: 'dropdown-item', isExternalLink: false, submenu: [] }
    ] 
  },
  { path: '/history', title: 'History', icon: 'ft-history',class: '', isExternalLink: false, permission: 'rfq.view', submenu: [
  ] },
  
];
