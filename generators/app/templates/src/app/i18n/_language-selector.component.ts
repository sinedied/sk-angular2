import { Component, OnInit, Input } from '@angular/core';
<% if (props.ui === 'ionic') { -%>
import { TranslateService } from '@ngx-translate/core';
import { TextFieldTypes } from '@ionic/core';
import { AlertController } from '@ionic/angular';
<% } -%>

import { I18nService } from './i18n.service';

<% if (props.ui === 'bootstrap' || props.ui === 'material') { -%>
// Local language name
enum ELanguages {
  'de-DE' = 'Deutsche',
  'en-US' = 'English',
  'es-ES' = 'Español', // Castellano
  'fr-FR' = 'Française',
  'it-IT' = 'Italiano',
  'pt-BR' = 'pt-BR', // Português do Brasil
  'zh-CN' = 'zh-CN' // 简体中文
}
<% } -%>

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {
<% if (props.ui === 'material') { -%>
  @Input() icon = false;
<% } -%>
<% if (props.ui === 'ionic') { -%>
  @Input() type = 'icon';
  @Input() itemClass = '';
<% } -%>
<% if (props.ui === 'bootstrap') { -%>
  @Input() inNavbar = false;
  @Input() menuClass = '';
<% } -%>

  constructor(
<% if (props.ui === 'ionic') { -%>
    private alertController: AlertController,
    private translateService: TranslateService,
<% } -%>
    private i18nService: I18nService
  ) { }

  ngOnInit() { }

  setLanguage(language: string) {
    this.i18nService.language = language;
  }

  get currentLanguage(): string {
    return this.i18nService.language;
  }

  get languages(): string[] {
    return this.i18nService.supportedLanguages;
  }

<% if (props.ui === 'bootstrap' || props.ui === 'material') { -%>
  public getLanguageName(languageName: string): string {
    const langName: string = ELanguages[ languageName ];
    return langName;
  }
<% } -%>

<% if (props.ui === 'ionic') { -%>

  async changeLanguage() {
    const alertController = await this.alertController.create({
      header: this.translateService.instant('Change language'),
      inputs: this.i18nService.supportedLanguages.map(language => ({
        type: 'radio' as TextFieldTypes,
        name: language,
        label: language,
        value: language,
        checked: language === this.i18nService.language
      })),
      buttons: [
        {
          text: this.translateService.instant('Cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.instant('Ok'),
          handler: language => {
            this.i18nService.language = language;
          }
        }
      ]
    });
    alertController.present();
  }
<% } -%>

}

