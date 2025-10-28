export interface QIAttachment {
  id: number;
  fileName: string;
  contentType?: string;
  content?: string; // base64
}