import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { SessionIdleService } from './shared/auth/session-idle.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {

    subscription: Subscription;

    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        _sessionIdle: SessionIdleService
    ) {
    }

    ngOnInit() {
        this.subscription = this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd)
            )
            .subscribe(() => window.scrollTo(0, 0));

        this.spinner.show();
        setTimeout(() => {
            this.spinner.hide();
        }, 1000);
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
