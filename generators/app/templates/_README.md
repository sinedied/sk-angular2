# <%= props.appName %>

This project was generated with [ngX-Rocket](https://github.com/ngx-rocket/generator-ngx-rocket/)
version <%= version %>

# Getting started

1. Go to project folder and install dependencies:
 ```sh
 npm install
 ```

2. Launch development server, and open `localhost:4200` in your browser:
 ```sh
 npm start
 ```

# Project structure

```
<% if (props.target.includes('cordova')) { -%>
<%   if (props.target.includes('web')) { -%>
www/                         web app production build
<%   } -%>
dist/                        mobile app production build
<% } else { -%>
dist/                        web app production build
<% } -%>
docs/                        project docs and coding guides
src/                         project source code
|- app/                      app components
|  |- core/                  core module (singleton services and single-use components)
|  |- shared/                shared module  (common components, directives and pipes)
|  |- app.component.*        app root component (shell)
|  |- app.module.ts          app root module definition
|  |- app-routing.module.ts  app routes
|  +- ...                    additional modules and components
|- assets/                   app assets (images, fonts, sounds...)
|- environments/             values for various build environments
|- theme/                    app global scss variables and theme
|- translations/             translations files
|- index.html                html entry point
|- main.scss                 global style entry point
|- main.ts                   app entry point
|- polyfills.ts              polyfills needed by Angular
<% if (props.tools.includes('jest')) { -%>
+- setup-jest.ts             unit tests entry point
<% } else { -%>
+- test.ts                   unit tests entry point
<% } -%>
<% if (props.target.includes('cordova')) { -%>
platforms/                   Cordova platform-specific projects
plugins/                     Cordova plugins
<% } -%>
reports/                     test and coverage reports
proxy.conf.js                backend proxy configuration
```

# Main tasks

Task automation is based on [NPM scripts](https://docs.npmjs.com/misc/scripts).

Task                            | Description
--------------------------------|--------------------------------------------------------------------------------------
`npm start`                     | Run development server on `http://localhost:4200/`
<% if (props.pwa) { -%>
`npm run serve:sw`              | Run test server on `http://localhost:4200/` with service worker enabled
<% } -%>
<% if (props.target.includes('web')) { -%>
<%   if (props.target.includes('cordova')) { -%>
`npm run build [-- --configuration=production]` | Lint code and build web app for production (with [AOT](https://angular.io/guide/aot-compiler)) in `www/` folder
<%   } else { -%>
`npm run build [-- --configuration=production]` | Lint code and build web app for production (with [AOT](https://angular.io/guide/aot-compiler)) in `dist/` folder
<%   } -%>
<% } -%>
<% if (props.target.includes('cordova')) { -%>
`npm run cordova:prepare`       | Prepare for building mobile app (restore Cordova platforms and plugins)
`npm run cordova:run <ios/android> [--device]`          | Run app on target platform device or simulator
`npm run cordova:build [-- --configuration=production]` | Build mobile app for production in `dist/` folder
`npm run cordova:clean`         | Removes `www/`, `platforms/` and `plugins/` folders
<% } -%>
<% if (props.target.includes('electron')) { -%>
`npm run electron:build`        | Build desktop app
`npm run electron:run`          | Run app on electron
`npm run electron:package`      | Package app for all supported platforms
<% } -%>
`npm test`                      | Run unit tests via [Karma](https://karma-runner.github.io) in watch mode
`npm run test:ci`               | Lint code and run unit tests once for continuous integration
`npm run e2e`                   | Run e2e tests using [Protractor](http://www.protractortest.org)
`npm run lint`                  | Lint code
`npm run translations:extract`  | Extract strings from code and templates to `src/app/translations/template.json`
<% if (props.tools.includes('hads')) { -%>
`npm run docs`                  | Display project documentation and coding guides
<% } -%>
<% if (props.tools.includes('compodoc')) { -%>
`npm run compodoc`              | Generates and display generates documentation from code
<% } -%>
<% if (props.tools.includes('prettier')) { -%>
`npm run prettier`              | Automatically format all `.ts`, `.js` & `.scss` files
<% } -%>

When building the application, you can specify the target configuration using the additional flag
`--configuration <name>` (do not forget to prepend `--` to pass arguments to npm scripts).

The default build configuration is `prod`.

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change
any of the source files.
You should not use `ng serve` directly, as it does not use the backend proxy configuration by default.

## Code scaffolding

Run `npm run generate -- component <name>` to generate a new component. You can also use
`npm run generate -- directive|pipe|service|class|module`.

If you have installed [angular-cli](https://github.com/angular/angular-cli) globally with `npm install -g @angular/cli`,
you can also use the command `ng generate` directly.

## Additional tools

Tasks are mostly based on the `angular-cli` tool. Use `ng help` to get more help or go check out the
[Angular-CLI README](https://github.com/angular/angular-cli).

<% if (props.tools.includes('prettier')) { -%>
## Code formatting

All `.ts`, `.js` & `.scss` files in this project are formatted automatically using [Prettier](https://prettier.io),
and enforced via the `test:ci` script.
<% if (options.git) { -%>

A pre-commit git hook has been configured on this project to automatically format staged files, using
(pretty-quick)[https://github.com/azz/pretty-quick], so you don't have to care for it.

You can also force code formatting by running the command `npm run prettier`.
<% } else { -%>

You can force code formatting by running the command `npm run prettier`.

To improve your workflow, you should consider adding a [pre-commit hook](https://prettier.io/docs/en/precommit.html)
to make sure that code is formatted properly. 

You can also take a look at [editors integration](https://prettier.io/docs/en/editors.html) if you do not want to
setup a pre-commit hook.
<% } -%>

<% } -%>
# What's in the box

The app template is based on [HTML5](http://whatwg.org/html), [TypeScript](http://www.typescriptlang.org) and
[Sass](http://sass-lang.com). The translation files use the common [JSON](http://www.json.org) format.

#### Tools

Development, build and quality processes are based on [angular-cli](https://github.com/angular/angular-cli) and
[NPM scripts](https://docs.npmjs.com/misc/scripts), which includes:

- Optimized build and bundling process with [Webpack](https://webpack.github.io)
- [Development server](https://webpack.github.io/docs/webpack-dev-server.html) with backend proxy and live reload
- Cross-browser CSS with [autoprefixer](https://github.com/postcss/autoprefixer) and
  [browserslist](https://github.com/ai/browserslist)
- Asset revisioning for [better cache management](https://webpack.github.io/docs/long-term-caching.html)
- Unit tests using [Jasmine](http://jasmine.github.io) and [Karma](https://karma-runner.github.io)
- End-to-end tests using [Protractor](https://github.com/angular/protractor)
- Static code analysis: [TSLint](https://github.com/palantir/tslint), [Codelyzer](https://github.com/mgechev/codelyzer),
  [Stylelint](http://stylelint.io) and [HTMLHint](http://htmlhint.com/)
<% if (props.tools.includes('hads')) { -%>
- Local knowledgebase server using [Hads](https://github.com/sinedied/hads)
<% } -%>
<% if (props.tools.includes('compodoc')) { -%>
- Automatic Angular documentation generation using [Compodoc](https://compodoc.app)
<% } -%>
<% if (props.tools.includes('prettier')) { -%>
- Automatic code formatting with [Prettier](https://prettier.io)
<% } -%>

#### Libraries

- [Angular](https://angular.io)
<% if (props.ui === 'bootstrap') { -%>
- [Bootstrap 4](https://getbootstrap.com)
- [ng-bootsrap](https://ng-bootstrap.github.io/)
- [Font Awesome](http://fontawesome.io)
<% } else if (props.ui === 'ionic') { -%>
- [Ionic](http://ionicframework.com)
- [Ionic Native](https://ionicframework.com/docs/native/)
<% } else if (props.ui === 'material') { -%>
- [Angular Material](https://material.angular.io)
- [Angular Flex Layout](https://github.com/angular/flex-layout)
- [Material Icons](https://material.io/icons/)
<% } -%>
- [RxJS](http://reactivex.io/rxjs)
- [ngx-translate](https://github.com/ngx-translate/core)
<% if (props.utility.includes('lodash')) { -%>
- [Lodash](https://lodash.com)
<% } -%>
<% if (props.utility.includes('ramda')) { -%>
- [Ramda](https://ramdajs.com)
<% } -%>
<% if (props.utility.includes('moment')) { -%>
- [Moment.js](https://momentjs.com)
<% } -%>
<% if (props.utility.includes('datefns')) { -%>
- [Date-fns](https://date-fns.org)
<% } -%>

#### Coding guides

- [Angular](docs/coding-guides/angular.md)
- [TypeScript](docs/coding-guides/typescript.md)
- [Sass](docs/coding-guides/sass.md)
- [HTML](docs/coding-guides/html.md)
- [Unit tests](docs/coding-guides/unit-tests.md)
- [End-to-end tests](docs/coding-guides/e2e-tests.md)

#### Other documentation

- [I18n guide](docs/i18n.md)
- [Working behind a corporate proxy](docs/corporate-proxy.md)
- [Updating dependencies and tools](docs/updating.md)
- [Using a backend proxy for development](docs/backend-proxy.md)
- [Browser routing](docs/routing.md)
