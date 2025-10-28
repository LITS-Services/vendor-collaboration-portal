import { VendorBidAttachment } from "./vendor-bid-attachment.model";

export interface BidSubmissionDetails {
  isDeleted?: any;
  id?: number;
  quotationRequestId?: number;
  quotationItemId?: number;
  vendorUserId?: string;
  biddingAmount?: number;
  comment?: string;
  vendorBidAttachments?: VendorBidAttachment[];
}

