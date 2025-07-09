import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-company-profile-attachment',
  templateUrl: './company-profile-attachment.component.html',
  styleUrls: ['./company-profile-attachment.component.scss']
})
export class CompanyProfileAttachmentComponent implements OnInit {
  @Input() attachedFiles: any[] = [];
  @Output() saveAttachment = new EventEmitter<any[]>();
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  attachment = {
    fileName: '',
    format: '',
    attachedBy: '',
    remarks: ''
  };
  editIndex: number | null = null;
  deleteIndex: number | null = null;
  showAttachmentDeletePopup: boolean = false;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    console.log('Initial Attached Files in Modal:', this.attachedFiles);
  }
 
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.attachment.fileName = file.name;
      this.attachment.format = file.type || 'Unknown Format';
    }
  }

  attachDocument(): void {
    if (!this.attachment.fileName || !this.attachment.attachedBy || !this.attachment.remarks) {
      alert('Please fill out all fields before attaching.');
      return;
    }
  
    const now = new Date(); // Get the current date and time
    const formattedDate = now.toLocaleDateString(); // Format as MM/DD/YYYY
    const formattedTime = now.toLocaleTimeString(); // Format as HH:MM:SS
  
    const newAttachment = {
      ...this.attachment,
      date: formattedDate,
      time: formattedTime
    };
  
    if (this.editIndex !== null) {
      // Update the existing file
      this.attachedFiles[this.editIndex] = newAttachment;
      this.editIndex = null;
    } else {
      // Add a new file
      this.attachedFiles.push(newAttachment);
    }
  
    // Reset the form
    this.attachment = {
      fileName: '',
      format: '',
      attachedBy: '',
      remarks: ''
    };
  
    // Clear the file input field explicitly
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  

  editFile(index: number): void {
    // Populate the form with the file data for editing
    this.attachment = { ...this.attachedFiles[index] };
    this.editIndex = index;
  }
  openAttachmentDeletionPopup(index: number): void {
    this.showAttachmentDeletePopup = true;
    this.deleteIndex = index; // Save the index to delete after confirmation
  }
  closeAttachmentDeletePopup(): void {
    this.showAttachmentDeletePopup = false;
    this.deleteIndex = null;
  }
  deleteFile(index: number): void {
    // Remove the selected file
    this.attachedFiles.splice(index, 1);
    this.closeAttachmentDeletePopup();
  }

  saveAttachments(): void {
    // Emit the updated file list to the parent component
    this.saveAttachment.emit([...this.attachedFiles]);
    this.activeModal.close();
  }
}
