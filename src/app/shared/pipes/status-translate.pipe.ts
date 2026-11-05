import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'statusTranslate',
  standalone: false,
  pure: false
})
export class StatusTranslatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    // Handle boolean values (e.g. isActive, active, isDeleted = true/false)
    if (typeof value === 'boolean') {
      const key = value ? 'ACTIVE' : 'INACTIVE';
      return this.translate.instant('STATUS.' + key);
    }

    const str = String(value).trim();
    if (!str || str === '—' || str === '-') {
      return str;
    }

    // Normalization: strip spaces, hyphens, underscores to uppercase
    const normalized = str
      .replace(/[\s\-_]+/g, '')
      .toUpperCase();

    const keyMap: Record<string, string> = {
      'NEW': 'NEW',
      'INPROGRESS': 'IN_PROGRESS',
      'SENDBACK': 'SENDBACK',
      'APPROVED': 'APPROVED',
      'REJECTED': 'REJECTED',
      'COMPLETED': 'COMPLETED',
      'DRAFT': 'DRAFT',
      'ACTIVE': 'ACTIVE',
      'INACTIVE': 'INACTIVE',
      'IN_ACTIVE': 'INACTIVE',
      'ONBOARDED': 'ONBOARDED',
      'NOTREGISTERED': 'NOT_REGISTERED',
      'NOT_REGISTERED': 'NOT_REGISTERED',
      'OPEN': 'OPEN',
      'CLOSED': 'CLOSED',
      'DELIVERED': 'DELIVERED',
      'PAID': 'PAID',
      'AWARDED': 'AWARDED',
      'SUCCESSFUL': 'SUCCESSFUL',
      'ACCEPTED': 'ACCEPTED',
      'PENDING': 'PENDING',
      'PENDINGFORPAYMENT': 'PENDING_FOR_PAYMENT',
      'APPROVEDFORPAYMENT': 'APPROVED_FOR_PAYMENT',
      'ONHOLD': 'ON_HOLD',
      'SUBMITTED': 'SUBMITTED',
      'CANCELLED': 'CANCELLED',
      'CANCELED': 'CANCELLED',
      'UNDERREVIEW': 'UNDER_REVIEW',
      'SAVING': 'SAVING',
      'RECEIVED': 'RECEIVED',
      'PARTIALLYRECEIVED': 'PARTIALLY_RECEIVED',
      'PARTIALLYDELIVERED': 'PARTIALLY_DELIVERED',
      'ALL': 'ALL',
      'SEND': 'SEND',
      'RESEND': 'RESEND',
      'BANNED': 'BANNED',
      'CLOSE': 'CLOSE',
      'TRUE': 'ACTIVE',
      'FALSE': 'INACTIVE',
      'YES': 'ACTIVE',
      'NO': 'INACTIVE',
      'APPROVE': 'APPROVED',

      // Item types & Quotation Bid statuses
      'INVENTORY': 'INVENTORY',
      'NONINVENTORY': 'NON_INVENTORY',
      'NON_INVENTORY': 'NON_INVENTORY',
      'SERVICE': 'SERVICE',
      'PENDINGSUBMIT': 'PENDING_SUBMIT',
      'PENDING_SUBMIT': 'PENDING_SUBMIT',
      'MYQUOTE': 'MY_QUOTE',
      'MY_QUOTE': 'MY_QUOTE',

      // Bid/Quote status variations
      'BID': 'QUOTE',
      'QUOTE': 'QUOTE',
      'BIDS': 'QUOTES',
      'QUOTES': 'QUOTES',

      // Arabic reverse lookups (normalized without spaces)
      'جديد': 'NEW',
      'قيدالمعالجة': 'IN_PROGRESS',
      'قيدالتنفيذ': 'IN_PROGRESS',
      'قيدالتقدم': 'IN_PROGRESS',
      'معتمد': 'APPROVED',
      'مرفوض': 'REJECTED',
      'مكتمل': 'COMPLETED',
      'مسودة': 'DRAFT',
      'نشط': 'ACTIVE',
      'غيرنشط': 'INACTIVE',
      'مفتوح': 'OPEN',
      'مغلق': 'CLOSED',
      'المخزون': 'INVENTORY',
      'مخزون': 'INVENTORY',
      'غيرمخزني': 'NON_INVENTORY',
      'خدمة': 'SERVICE',
      'بانتظارالتقديم': 'PENDING_SUBMIT',
      'قيدالإرسال': 'PENDING_SUBMIT',
      'قيدالارسال': 'PENDING_SUBMIT',
      'تمالتقديم': 'SUBMITTED',
      'معلق': 'PENDING'
    };

    const statusKey = keyMap[normalized];
    if (statusKey) {
      const translationKey = 'STATUS.' + statusKey;
      const translated = this.translate.instant(translationKey);
      if (translated && translated !== translationKey) {
        return translated;
      }
    }

    // Fallback: check direct translation key or return original string
    const directTranslate = this.translate.instant(str);
    if (directTranslate && directTranslate !== str) {
      return directTranslate;
    }

    return str;
  }
}
