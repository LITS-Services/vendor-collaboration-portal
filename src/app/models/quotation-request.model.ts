import { QRItem } from "./qr-item.model";

export interface QuotationRequest {
  id: number;
  rfqNo: string;
  purchaseRequestNo?: string;
  owner?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  title?: string;
  contact?: string;
  deliveryLocation?: string;
  requestStatusId?: number;
  requestStatus?: string;
  totalAmount?: number;
  qrItems?: QRItem[];
}