// quotation-request.model.ts

import { BidSubmissionDetails } from "./bid-submission.model";

export interface QuotationItemAttachmentResponse {
  id: number;
  content?: string;
  contentType?: string;
  fileName?: string;
  fromForm?: string;
  quotationItemId?: number;
}

export interface QuotationItemsResponse {
  id: number;
  rfqNo?: string;
  itemType?: string;
  itemId?: number;
  itemName?: string;
  unitOfMeasurementId?: number;
  unitOfMeasurementCode?: string;
  amount?: number;
  unitCost?: number;
  orderQuantity?: number;
  reqByDate?: string;
  itemDescription?: string;
  accountId?: number;
  accountName?: string;
  remarks?: string;
  quotationRequestId?: number;
  vendorUserId?: string;
  vendorName?: string;
  vendorCompanyId?: string;
  quotationItemAttachments?: QuotationItemAttachmentResponse[];
  bidSubmissionDetails?: BidSubmissionDetails[];

}

export interface QuotationRequestWithDetailsResponse {
  id: number;
  rfqNo?: string;
  purchaseRequestNo?: string;
  owner?: string;
  date?: string;
  contact?: string;
  deliveryLocation?: string;
  startDate?: string;
  endDate?: string;
  title?: string;
  workflowMasterId?: number;
  comment?: string;
  mainApproverId?: string;
  submitterId?: string;
  purchaseRequestId?: number;
  requestStatusId?: number;
  requestStatus?: string;
  quotationItems?: QuotationItemsResponse[];
}
