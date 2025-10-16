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

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  currentLang = "en";
  selectedLanguageText = "English";
  selectedLanguageFlag = "./assets/img/flags/us.png";
  toggleClass = "ft-maximize";
  placement = "bottom-right";
  logoUrl = 'assets/img/icons/vp.png';
  menuPosition = 'Side';
  isSmallScreen = false;
  username: string = '';
  profilePicture: string = 'assets/img/portrait/small/avatar-s-1.png'; // default avatar

    public menuItems: any[];

  protected innerWidth: any;
  searchOpenClass = "";
  transparentBGClass = "";
  hideSidebar: boolean = true;
  public isCollapsed = true;
  layoutSub: Subscription;
  configSub: Subscription;

  @ViewChild('search') searchElement: ElementRef;
  @ViewChildren('searchResults') searchResults: QueryList<any>;

  @Output() toggleHideSidebar = new EventEmitter<Object>();
  @Output() seachTextEmpty = new EventEmitter<boolean>();

  listItems = [];
  control = new UntypedFormControl();
  public config: any = {};

  constructor(
    public translate: TranslateService,
    private layoutService: LayoutService,
    private router: Router,
    private toastr: ToastrService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private companyService: CompanyService // ✅ injected
  ) {
    const browserLang: string = translate.getBrowserLang();
    translate.use(browserLang.match(/en|es|pt|de/) ? browserLang : "en");
    this.config = this.configService.templateConf;
    this.innerWidth = window.innerWidth;

    this.layoutSub = layoutService.toggleSidebar$.subscribe(
      isShow => {
        this.hideSidebar = !isShow;
      });
  }

  ngOnInit() {
    this.listItems = LISTITEMS;

    this.isSmallScreen = this.innerWidth < 1200;

    // ✅ Load user profile for navbar
    this.loadNavbarUser();

        // Build tabs from HROUTES once (or on config stream if needed)
      this.menuItems = (HROUTES || [])
    .filter(x => x && x.title && (x.path || x.isExternalLink))   // basic sanity
    .filter(x => !x.submenu || x.submenu.length === 0);  
  }

  ngAfterViewInit() {
    this.configSub = this.configService.templateConf$.subscribe((templateConf) => {
      if (templateConf) this.config = templateConf;
      this.loadLayout();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.layoutSub) this.layoutSub.unsubscribe();
    if (this.configSub) this.configSub.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
    this.isSmallScreen = this.innerWidth < 1200;
  }

  loadLayout() {
    if (this.config.layout.menuPosition?.toString().trim() != "") {
      this.menuPosition = this.config.layout.menuPosition;
    }

    this.logoUrl = 'assets/img/icons/vp.png'; // same for light/dark in your setup
    this.transparentBGClass = this.config.layout.variant === "Transparent" ? this.config.layout.sidebar.backgroundColor : "";
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.toastr.success('You have been logged out successfully', 'Logout');
    this.router.navigate(['/pages/login']);
  }

  // =========================
  // 🔹 Navbar User API
  // =========================
  loadNavbarUser() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.companyService.GetVendoruserByid(userId).subscribe({
      next: (res: any) => {
        const userData = res.$values ? res.$values[0] : res;
        this.username = userData.userName || '';
        this.profilePicture = userData.profilePicture || 'assets/img/portrait/small/avatar-s-1.png';
        this.cdr.detectChanges(); // update UI immediately
      },
      error: err => {
        console.error('Error loading navbar user:', err);
      }
    });
  }

  onSearchKey(event: any) {
    if (this.searchResults?.length > 0) {
      this.searchResults.first.host.nativeElement.classList.add('first-active-item');
    }
    this.seachTextEmpty.emit(event.target.value === "");
  }

  removeActiveClass() {
    if (this.searchResults?.length > 0) {
      this.searchResults.first.host.nativeElement.classList.remove('first-active-item');
    }
  }

  onEscEvent() {
    this.control.setValue("");
    this.searchOpenClass = '';
    this.seachTextEmpty.emit(true);
  }

  onEnter() {
    if (this.searchResults?.length > 0) {
      let url = this.searchResults.first.url;
      if (url) {
        this.control.setValue("");
        this.searchOpenClass = '';
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
    if (language === 'en') { this.selectedLanguageText = "English"; this.selectedLanguageFlag = "./assets/img/flags/us.png"; }
    else if (language === 'es') { this.selectedLanguageText = "Spanish"; this.selectedLanguageFlag = "./assets/img/flags/es.png"; }
    else if (language === 'pt') { this.selectedLanguageText = "Portuguese"; this.selectedLanguageFlag = "./assets/img/flags/pt.png"; }
    else if (language === 'de') { this.selectedLanguageText = "German"; this.selectedLanguageFlag = "./assets/img/flags/de.png"; }
  }

  ToggleClass() {
    this.toggleClass = this.toggleClass === "ft-maximize" ? "ft-minimize" : "ft-maximize";
  }

  toggleSearchOpenClass(display) {
    this.control.setValue("");
    this.searchOpenClass = display ? 'open' : '';
    if (display) setTimeout(() => this.searchElement.nativeElement.focus(), 0);
    this.seachTextEmpty.emit(true);
  }

  toggleNotificationSidebar() {
    this.layoutService.toggleNotificationSidebar(true);
  }

  toggleSidebar() {
    this.layoutService.toggleSidebarSmallScreen(this.hideSidebar);
  }
}
