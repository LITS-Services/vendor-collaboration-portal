import { Component, Output, EventEmitter, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, Inject, Renderer2, ViewChild, ElementRef, ViewChildren, QueryList, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../services/layout.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { DOCUMENT } from '@angular/common';
import { CustomizerService } from '../services/customizer.service';
import { UntypedFormControl } from '@angular/forms';
import { LISTITEMS } from '../data/template-search';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'app/shared/services/company.service'; // ✅ added
import { HROUTES } from '../horizontal-menu/navigation-routes.config';
import { FirebaseMessagingService } from 'app/firebase-messaging.service';
import { NotifcationService, ReferenceType } from '../services/notification.service';
import { UserServiceService } from '../services/user-service.service';

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  currentLang = "en";
  selectedLanguageText = "English";
  selectedLanguageFlag = "./assets/img/flags/us.png";
  toggleClass = "ft-maximize";
  placement = "bottom-right";
  logoUrl = "assets/img/icons/vp.png";
  menuPosition = "Side";
  isSmallScreen = false;
  username: string = "";
  profilePicture: string = "assets/img/profile/user.png"; // default avatar
  private sub!: Subscription;

  public menuItems: any[];

  protected innerWidth: any;
  searchOpenClass = "";
  transparentBGClass = "";
  hideSidebar: boolean = true;
  public isCollapsed = true;
  layoutSub: Subscription;
  configSub: Subscription;

  @ViewChild("search") searchElement: ElementRef;
  @ViewChildren("searchResults") searchResults: QueryList<any>;

  @Output() toggleHideSidebar = new EventEmitter<Object>();
  @Output() seachTextEmpty = new EventEmitter<boolean>();

  listItems = [];
  control = new UntypedFormControl();
  public config: any = {};

  @ViewChild("notifRoot", { static: false })
  notifRoot!: ElementRef<HTMLElement>;

  notifOpen = false;

  notifications: any[] = [];
  unreadCount: number = null;
  notificationCount: number = null;

  constructor(
    public translate: TranslateService,
    private layoutService: LayoutService,
    private router: Router,
    private toastr: ToastrService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private companyService: CompanyService, // ✅ injected
    private messagingService: FirebaseMessagingService,
    private toaster: ToastrService,
    private notificationService: NotifcationService,
    private userService: UserServiceService
  ) {
    const browserLang: string = translate.getBrowserLang();
    translate.use(browserLang.match(/en|es|pt|de/) ? browserLang : "en");
    this.config = this.configService.templateConf;
    this.innerWidth = window.innerWidth;

    this.layoutSub = layoutService.toggleSidebar$.subscribe((isShow) => {
      this.hideSidebar = !isShow;
    });
  }

  ngOnInit() {
    this.sub = this.userService.profilePicture$.subscribe((url) => {
      this.profilePicture = url || "assets/img/profile/user.png";
      this.cdr.detectChanges();
    });

    this.getNotification();
    var userId = localStorage.getItem("userId");
    this.messagingService.requestPermission(userId);

    this.messagingService.currentMessage.subscribe((msg) => {
      if (msg) {
        this.toaster.success(
          msg.notification?.title || "New Notification",
          msg.notification?.body || ""
        );
        this.getNotification();
        // You can show a toast or alert here
      }
    });
    this.listItems = LISTITEMS;

    this.isSmallScreen = this.innerWidth < 1200;

    // ✅ Load user profile for navbar
    this.loadNavbarUser();

    // Build tabs from HROUTES once (or on config stream if needed)
    this.menuItems = (HROUTES || [])
      .filter((x) => x && x.title && (x.path || x.isExternalLink)) // basic sanity
      .filter((x) => !x.submenu || x.submenu.length === 0);
  }

  ngAfterViewInit() {
    this.configSub = this.configService.templateConf$.subscribe(
      (templateConf) => {
        if (templateConf) this.config = templateConf;
        this.loadLayout();
        this.cdr.markForCheck();
      }
    );
  }

  ngOnDestroy() {
    if (this.layoutSub) this.layoutSub.unsubscribe();
    if (this.configSub) this.configSub.unsubscribe();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
    this.isSmallScreen = this.innerWidth < 1200;
  }

  redirection(referenceType: any, referenceId: any) {
    switch (referenceType) {
      case ReferenceType.RFQ:
        this.router.navigate(["/rfq/submit-bid", referenceId], {
          skipLocationChange: true,
        });
        break;

      // case ReferenceType.PR:
      //   this.router.navigate(["/purchase-request/new-purchase-request"], {
      //     queryParams: { id: referenceId, mode: "view" },
      //     skipLocationChange: true,
      //   });
      //   break;

      case ReferenceType.PO:
        this.router.navigate(
          ["/purchase-order/purchase-order-details", referenceId],
          { skipLocationChange: true }
        );
          break;

      case ReferenceType.Default:
        return ReferenceType.Default;

      default:
        console.warn("Unhandled reference type:", referenceType);
        break;
    }
  }

  onNotifClick(n: any): void {
    const wasUnread = n.status === 0;
    n.status = 1;
    if (wasUnread && this.unreadCount > 0) this.unreadCount--;

    this.notificationService.markAsRead(n.id).subscribe({
      next: () => {
        var a = this.redirection(n.referenceType, n.referenceId);
        if (a == ReferenceType.Default) {
          this.notifications.filter((m: any) => m.id === n.id)[0].status = 1;
        }

        this.closePanel();
      },
      error: () => {
        if (wasUnread) {
          n.status = 0;
          this.unreadCount++;
        }
      },
    });
  }

  togglePanel(): void {
    this.notifOpen = !this.notifOpen;
  }

  closePanel(): void {
    this.notifOpen = false;
  }

  @HostListener("document:click", ["$event"])
  onDocClick(ev: MouseEvent): void {
    if (!this.notifOpen) return;
    const root = this.notifRoot?.nativeElement;
    if (root && !root.contains(ev.target as Node)) {
      this.closePanel();
    }
  }

  getNotification() {
    this.notificationService.getNotification().subscribe((res: any) => {
      this.notifications = res.messages.map((m: any, index: number) => ({
        id: m.id,
        title: m.title,
        message: m.message,
        timeAgo: this.timeSince(new Date(m.createdOn)),
        read: false,
        status: m.status,
        createdOn: m.createdOn,
        referenceType: m.referenceType as ReferenceType,
        referenceId: m.referenceId,
      }));
      this.notificationCount = res.messages?.length;
      this.unreadCount = res.unreadCount;
      this.cdr.detectChanges();
    });
  }
  loadLayout() {
    if (this.config.layout.menuPosition?.toString().trim() != "") {
      this.menuPosition = this.config.layout.menuPosition;
    }

    this.logoUrl = "assets/img/icons/vp.png"; // same for light/dark in your setup
    this.transparentBGClass =
      this.config.layout.variant === "Transparent"
        ? this.config.layout.sidebar.backgroundColor
        : "";
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.toastr.success("You have been logged out successfully", "Logout");
    this.router.navigate(["/pages/login"]);
  }

  // =========================
  // 🔹 Navbar User API
  // =========================
  loadNavbarUser() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    this.companyService.GetVendoruserByid(userId).subscribe({
      next: (res: any) => {
        const userData = res.$values ? res.$values[0] : res;
        this.username = userData.userName || "";
        this.profilePicture =
          userData.profilePicture || "assets/img/profile/user.png";
        this.cdr.detectChanges(); // update UI immediately
      },
      error: (err) => {
        console.error("Error loading navbar user:", err);
      },
    });
  }

  onSearchKey(event: any) {
    if (this.searchResults?.length > 0) {
      this.searchResults.first.host.nativeElement.classList.add(
        "first-active-item"
      );
    }
    this.seachTextEmpty.emit(event.target.value === "");
  }

  removeActiveClass() {
    if (this.searchResults?.length > 0) {
      this.searchResults.first.host.nativeElement.classList.remove(
        "first-active-item"
      );
    }
  }

  onEscEvent() {
    this.control.setValue("");
    this.searchOpenClass = "";
    this.seachTextEmpty.emit(true);
  }

  onEnter() {
    if (this.searchResults?.length > 0) {
      let url = this.searchResults.first.url;
      if (url) {
        this.control.setValue("");
        this.searchOpenClass = "";
        this.router.navigate([url]);
        this.seachTextEmpty.emit(true);
      }
    }
  }

  redirectTo(value) {
    this.router.navigate([value]);
    this.seachTextEmpty.emit(true);
  }

  ChangeLanguage(language: string) {
    this.translate.use(language);
    if (language === "en") {
      this.selectedLanguageText = "English";
      this.selectedLanguageFlag = "./assets/img/flags/us.png";
    } else if (language === "es") {
      this.selectedLanguageText = "Spanish";
      this.selectedLanguageFlag = "./assets/img/flags/es.png";
    } else if (language === "pt") {
      this.selectedLanguageText = "Portuguese";
      this.selectedLanguageFlag = "./assets/img/flags/pt.png";
    } else if (language === "de") {
      this.selectedLanguageText = "German";
      this.selectedLanguageFlag = "./assets/img/flags/de.png";
    }
  }

  ToggleClass() {
    this.toggleClass =
      this.toggleClass === "ft-maximize" ? "ft-minimize" : "ft-maximize";
  }

  toggleSearchOpenClass(display) {
    this.control.setValue("");
    this.searchOpenClass = display ? "open" : "";
    if (display) setTimeout(() => this.searchElement.nativeElement.focus(), 0);
    this.seachTextEmpty.emit(true);
  }

  toggleNotificationSidebar() {
    this.layoutService.toggleNotificationSidebar(true);
  }

  toggleSidebar() {
    this.layoutService.toggleSidebarSmallScreen(this.hideSidebar);
  }

  timeSince(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 30) return "just now";

    const units = [
      { label: "y", secs: 31536000 },
      { label: "mo", secs: 2592000 },
      { label: "w", secs: 604800 },
      { label: "d", secs: 86400 },
      { label: "h", secs: 3600 },
      { label: "m", secs: 60 },
    ];

    for (const u of units) {
      const v = Math.floor(seconds / u.secs);
      if (v >= 1) return `${v}${u.label} ago`;
    }
    // Fallback: seconds level shows as "1m ago" minimum; we handled <30s above
    return "1m ago";
  }
}
