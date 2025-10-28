import { BidSubmissionDetails } from "./bid-submission.model";
import { QIAttachment } from "./qi-attachment.model";

export interface QRItem {
  id: number;
  quotationRequestId: number;
  itemType?: string;
  itemId?: number;
  itemName?: string;
  itemDescription?: string;
  amount?: number;
  vendorUserId?: string;
  attachments?: QIAttachment[];
  bidSubmissionDetails?: BidSubmissionDetails[];
}