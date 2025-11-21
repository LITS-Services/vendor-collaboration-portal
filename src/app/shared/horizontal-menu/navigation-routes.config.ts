import { RouteInfo } from '../vertical-menu/vertical-menu.metadata';

export const HROUTES: RouteInfo[] = [

  // {
  //   path: '/dashboard/dashboard1', title: 'Dashboard', icon: 'ft-home', class: '', isExternalLink: false,
  //   submenu: [  
  //   ]
  // },
  { path: '/company', title: 'Companies', icon: 'ft-briefcase',class: '', isExternalLink: false, submenu: [
  ] },
  { path: '/rfq', title: 'RFQ', icon: 'fa fa-handshake-o',class: '', isExternalLink: false, submenu: [
  ] },
  { path: '/purchase-order', title: 'POs/SOs', icon: 'ft-shopping-cart', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
  // { path: '/tendering/tender-master', title: 'Tendering', icon: 'ft-dollar-sign',class: '', isExternalLink: false, submenu: [
  // ] },
  { path: '/reports', title: 'Reports', icon: 'ft-file-text',class: '', isExternalLink: false, submenu: [
  ] },
  { path: '/history', title: 'History', icon: 'ft-file-text',class: '', isExternalLink: false, submenu: [
  ] },
  
];
