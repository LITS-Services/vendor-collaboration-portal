import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-company-profile-attachment',
  templateUrl: './company-profile-attachment.component.html',
  styleUrls: ['./company-profile-attachment.component.scss'],
  standalone: false
})
export class CompanyProfileAttachmentComponent implements OnInit {
  @Input() attachedFiles: any[] = [];
  @Input() readonly = false;
  @Output() saveAttachment = new EventEmitter<any[]>();
  @ViewChild('fileInput') fileInput: ElementRef | undefined;

  attachment: any = {
    file: null,       // ✅ keep raw File
    fileName: '',
    format: '',
    attachedBy: '',
    remarks: '',
    attachedAt: '',
    expiryDate: '' // Added expiry date
  };

  editIndex: number | null = null;
  deleteIndex: number | null = null;
  showAttachmentDeletePopup: boolean = false;

  constructor() { }

  ngOnInit(): void {
    console.log('Initial Attached Files in Modal:', this.attachedFiles);
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.attachment.file = file;                  // ✅ store file
      this.attachment.fileName = file.name;
      this.attachment.format = file.type || 'Unknown Format';
    }
  }

  attachDocument(): void {
    if (this.readonly) return;

    if (!this.attachment.file || !this.attachment.fileName || !this.attachment.remarks) {
      alert('Please select a file and fill out all fields before attaching.');
      return;
    }

    // Manual validation for trade license expiry
    if (this.attachment.expiryDate) {
      const expiry = new Date(this.attachment.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry < today) {
        if (!confirm('The document appears to be expired. Do you still want to attach it?')) {
          return;
        }
      }
    }

    const now = new Date();

    const newAttachment = {
      ...this.attachment,
      attachedBy: this.attachment.attachedBy || localStorage.getItem('username') || '',
      attachedAt: now.toISOString()  // ✅ use ISO timestamp
    };

    if (this.editIndex !== null) {
      this.attachedFiles[this.editIndex] = newAttachment;
      this.editIndex = null;
    } else {
      this.attachedFiles.push(newAttachment);
    }

    this.resetAttachmentForm();
    this.emitChange();
  }

  private emitChange(): void {
    this.saveAttachment.emit([...this.attachedFiles]);
  }


  editFile(index: number): void {
    this.attachment = { ...this.attachedFiles[index] };
    this.editIndex = index;
  }

  openAttachmentDeletionPopup(index: number): void {
    this.showAttachmentDeletePopup = true;
    this.deleteIndex = index;
  }

  closeAttachmentDeletePopup(): void {
    this.showAttachmentDeletePopup = false;
    this.deleteIndex = null;
  }


  deleteFile(): void {
    if (this.deleteIndex === null || this.readonly) return;

    this.attachedFiles.splice(this.deleteIndex, 1);
    this.closeAttachmentDeletePopup();
    this.emitChange();
  }

  private resetAttachmentForm(): void {
    this.attachment = {
      file: null,
      fileName: '',
      format: '',
      attachedBy: '',
      remarks: '',
      attachedAt: '',
      expiryDate: '',
    };

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }


}
