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
  { path: '/purchase-order', title: 'POs/SOs', icon: 'ft-shopping-cart', class: '', badge: '', badgeClass: '', isExternalLink: false, permission: 'purchase-order.view', submenu: [] },
  { path: '/invoices', title: 'Invoices', icon: 'ft-invoice',class: '', isExternalLink: false, permission: 'purchase-order.view', submenu: [
  ] },
  { path: '/reports', title: 'Reports', icon: 'ft-file-text',class: '', isExternalLink: false, permission: 'purchase-order.view', submenu: [
  ] },
  { path: '/history', title: 'History', icon: 'ft-history',class: '', isExternalLink: false, permission: 'rfq.view', submenu: [
  ] },
  
];
