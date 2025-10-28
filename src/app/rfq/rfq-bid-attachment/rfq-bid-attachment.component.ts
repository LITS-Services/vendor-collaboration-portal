import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-rfq-bid-attachment',
  templateUrl: './rfq-bid-attachment.component.html',
  styleUrls: ['./rfq-bid-attachment.component.scss']
})
export class RfqBidAttachmentComponent implements OnInit {

  @Input() viewMode: boolean = false;
  @Input() data!: {
    existingAttachment?: any[],     // procurement attachments
    vendorAttachments?: any[],      // vendor attachments if editing
    bidSubmissionDetailsId: number;
  };

  @Output() attachmentsChange = new EventEmitter<any[]>();

  @ViewChild(DatatableComponent) table: DatatableComponent;

  AttachmentForm: FormGroup;
  procurementAttachments: any[] = [];
  vendorAttachments: any[] = [];

  constructor(private fb: FormBuilder, public activeModal: NgbActiveModal) {
    this.AttachmentForm = this.fb.group({});
  }

  ngOnInit(): void {
    // Procurement files (read-only)
    this.procurementAttachments = this.data?.existingAttachment
      ? this.data.existingAttachment.map(f => ({ ...f, isNew: false }))
      : [];

    // Vendor files (editable)
    this.vendorAttachments = this.data?.vendorAttachments
      ? [...this.data.vendorAttachments]
      : [];
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    for (const file of Array.from(input.files)) {
      const base64 = await this.toBase64(file);
      this.vendorAttachments.push({
        fileName: file.name,
        contentType: file.type,
        content: base64,
        fromForm: 'Vendor Upload',
        bidSubmissionDetailsId: this.data?.bidSubmissionDetailsId,
        isNew: true
      });
    }

    this.vendorAttachments = [...this.vendorAttachments]; // trigger UI update
  }

  uploadFiles() {
    const payload = this.vendorAttachments.filter(f => f.isNew);
    this.activeModal.close(payload); // return new files to parent
  }

  deleteVendorAttachment(index: number) {
    this.vendorAttachments.splice(index, 1);
    this.vendorAttachments = [...this.vendorAttachments];
  }

  downloadLocalFile(file: any) {
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.fileName;
    link.click();
  }

  private toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  closeDialog() {
    this.activeModal.close(false);
  }
}
