<% if (props.ui === 'ionic') { -%>
import { Component, OnInit, ViewChild } from '@angular/core';
<% } else if (props.target.includes('cordova')) { -%>
import { Component, OnInit, NgZone } from '@angular/core';
<% } else { -%>
import { Component, OnInit } from '@angular/core';
<% } -%>
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
<% if (props.ui === 'ionic') { -%>
<%   if (props.target.includes('cordova')) { -%>
import { IonicApp, Nav, Platform } from 'ionic-angular';
<%   } else { -%>
import { IonicApp, Nav } from 'ionic-angular';
<%   } -%>
<% } -%>
<% if (props.target.includes('cordova')) { -%>
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
<% } -%>
<% if (props.angulartics && props.analyticsProvider === 'ga') { -%>
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
<% } -%>

import { environment } from '@env/environment';
import { Logger, I18nService } from '@app/core';

const log = new Logger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
<% if (props.ui === 'ionic') { -%>

  @ViewChild(Nav) nav: Nav;
<% } -%>

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private titleService: Title,
              private translateService: TranslateService,
<% if (props.target.includes('cordova')) { -%>
<%  if (props.ui === 'ionic') { -%>
              private platform: Platform,
<%   } else { -%>
              private zone: NgZone,
<%   } -%>
              private statusBar: StatusBar,
              private splashScreen: SplashScreen,
<% } -%>
<% if (props.angulartics && props.analyticsProvider === 'ga') { -%>
              // do not remove the analytics injection, even if the call in ngOnInit() is removed
              // this injection initializes page tracking through the router
              private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
<% } -%>
              private i18nService: I18nService) { }

  async ngOnInit() {
    // Setup logger
    if (environment.production) {
      Logger.enableProductionMode();
    }

    log.debug('init');

<% if (props.angulartics && props.analyticsProvider === 'ga') { -%>
    this.angulartics2GoogleAnalytics.eventTrack(environment.version, {category: 'App initialized'});
<% } -%>

    // Setup translations
    this.i18nService.init(environment.defaultLanguage, environment.supportedLanguages);

    const onNavigationEnd = this.router.events.pipe(filter(event => event instanceof NavigationEnd));

    // Change page title on navigation or language change, based on route data
    merge(this.translateService.onLangChange, onNavigationEnd)
      .pipe(
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe(event => {
        const title = event['title'];
        if (title) {
          this.titleService.setTitle(this.translateService.instant(title));
        }
      });
<% if (props.ui === 'ionic') { -%>

    // Bind Ionic navigation to Angular router events
    onNavigationEnd.subscribe(() => this.updateNav(this.activatedRoute));
<%   if (props.target.includes('cordova')) { -%>

    // Cordova platform and plugins initialization
    await this.platform.ready();
    this.onCordovaReady();
<%   } -%>
<% } else if (props.target.includes('cordova')) { -%>
    // Cordova platform and plugins initialization
    document.addEventListener('deviceready', () => {
      this.zone.run(() => this.onCordovaReady());
    }, false);
<% } -%>
  }
<% if (props.target.includes('cordova')) { -%>

  private onCordovaReady() {
    if (window['cordova']) {
      window['Keyboard'].hideFormAccessoryBar(true);
<% if (props.ui === 'ionic') { -%>
      this.statusBar.styleLightContent();
<% } else { -%>
      this.statusBar.styleDefault();
<% } -%>
      this.splashScreen.hide();
    }
  }
<% } -%>
<% if (props.ui === 'ionic') { -%>
  private updateNav(route: ActivatedRoute) {
    if (route.component === IonicApp) {
      if (!route.firstChild) {
        return;
      }
      route = route.firstChild;
      if (!this.nav.getActive() || this.nav.getActive().component !== route.component) {
        this.nav.setRoot(route.component, route.params, { animate: true, direction: 'forward' });
      }
    }
  }
<% } -%>

}
