# Build-Specific Configuration

## tl;dr's

ngx-rocket comes with a very helpful `env` script that will save environment-variables set at build time to constants
that can be used as configuration for your code. When combined with the `dotenv-cli` package, it enables maximum
configurability while maintaining lots of simplicity for local development and testing.

### Cookbook for maximum independence of deployment-specific configuration

Disclaimer: If you have a full-stack app in a monorepo, keep separate `.env` files for server-side and client-side
configs, and make sure `.env` files are .gitignore'd and that secrets never make it into client-side `.env` file.

For each configurable variable (e.g. BROWSER_URL, API_URL):

- Add it to package.json's env script so that the build-time variables will be saved for runtime:

  ```javascript
  {
    "scripts": {
      "env": "ngx-scripts env npm_package_version BROWSER_URL API_URL",
    }
  }
  ```

- Add it to or edit it in src/environments/environment.ts to expose it to your app as e.g. environment.API_URL:
  ```typescript
  export const environment = {
    // ...
    API_URL: env.API_URL,
    BROWSER_URL: env.BROWSER_URL,
    // ...
  }
  ```
- Configure your CI's deployment to set the variables and export them to the build script before building - if your CI
  gives you a shell script to run, make it something like this:
  ```shell
  # bourne-like shells...
  export API_URL='https://api.staging.example.com'
  export BROWSER_URL='https://staging.example.com'
  # ...
  npm run build:ssr-and-client
  ```
- Finally, to have your cake and eat it too and avoid having to do all that for local development and testing (or clutter
  your package.json up), install the `dotenv-cli` package and update your development-related npm scripts to take advantage
  of it:
  ```shell
  # environment.development.env.sh
  BROWSER_URL='http://localhost:4200'
  API_URL='http://localhost:4200'
  ```
  ```javascript
  {
    "scripts": {
      "start": "dotenv -e environment.development.env.sh -- npm run env && ng serve --aot",
    }
  }
  ```

This way, app configurations will always come from deploy-specific environment variables, and your development environments
are still easy to work with.

For configuring the build itself (for example, if you want your QA build to be similar to your production build, but with
source maps enabled), consider avoiding adding a build configuration to angular.json, and instead adding the respective
overriding flag to the `ng` command in package.json:
```javascript
{
  "scripts": {
    "build:client-and-server-bundles:qa": "NG_BUILD_OVERRIDES='--sourceMap=true' npm run build:client-and-server-bundles",
    "build:client-and-server-bundles": "npm run build:client-bundles && npm run build:server-bundles",
    "build:client-bundles": "npm run env && ng build --prod $NG_BUILD_OVERRIDES",
  }
}
```

The development server API proxy config can read runtime environment variables, so you can avoid having a superficial
dev-server configuration by taking advantage of them:
```javascript
{
  "scripts": {
    "start": "dotenv -e environment.development.env.sh -- npm run env && API_PROXY_HOST='http://localhost:9000' ng serve --aot"
  }
}
```
```javascript
const proxyConfig = [
  {
    context: '/api',
    pathRewrite: { '^/api': '' },
    target: `${process.env.API_PROXY_HOST}/api`,
    changeOrigin: true,
    secure: false,
  },
  {
    context: '/auth',
    pathRewrite: { '^/auth': '' },
    target: `${process.env.API_PROXY_HOST}/auth`,
    changeOrigin: true,
    secure: false,
  },
];
```

Quick SSR note: SSR works by building all the client bundles like normal, but then rendering them in real-time. So,
- the rest of your app from `main.server.ts` down has access to your build-time environment only, like your normal
  client bundles
- but `server.ts` (the file configuring and running express) has access to your serve-time environment variables

### Less optimal alternatives

- On the opposite extreme of the spectrum, you can keep all build-specific configuration in a separate environment
  file for each environment using Angular's built-in `fileReplacements`, but then you'll need a separate environment
  file even for deployment-specific configuration (like hostnames), which can get out of hand fast.
- For a middle-of-the-road approach, you can divide configuration into two groups:
  * Configuration shared by each environment-type:
    - Environment-type examples include local development, staging/qa, test, production...
    - Examples of configuration like this include:
      * In test, animations are always disabled, but for all other environments, they're enabled
      * In production, the payment gateway's publishable key is the live key, but all other environments use the
        test key
  * Configuration that sometimes needs to be specific to an individual deployment of a given environment:
    - Examples of configuration like this include:
      * This particular staging/qa server's base for constructing URLs is qa-stable.example.com, but qa/staging
        environments could also be deployed to preprod.example.com or localhost:8081 or anywhereelse:7000.
      * This particular deployment uses a specific bucket for Amazon S3 uploads
  * In this approach, you can use Angular's `fileReplacements` for anything environment-specific and ngx-rocket's
    `env` for anything deployment-specific. You can even have certain deployment-specific configuration fall back
    to environment-specific defaults for certain environments like so:
      ```javascript
      export const environment = {
        // ...
          BROWSER_URL: env.BROWSER_URL || 'https://qa.example.com',
        // ...
      }
      ```
- If you don't have lots of environment variables, you can avoid dotenv-cli and use your particular shell's method
  to expose the variables before running the ngx-rocket env tool.

## Introduction

When building any maintainable application, a separation of configuration and code is always desired. In the case
of configuration, some of it will need to vary from environment to environment, build to build, or deployment to
deployment.

This guide focuses on this type of build-specific configuration in a very broad sense of an Angular app, describing
the specific Angular ways of controlling these configurations, detailing some angular-specific challenges, and
highlighting some ngx-rocket tooling that help with them in mind.

For an even broader non-Angular introduction of these concepts, see the
[The Twelve-Factor App](https://12factor.net/config) methodology's opinions on how this type of configuration
should be managed.

## Types of configuration

At the highest level, build-specific configuration can be divided into two categories:

1. Configuration for how your app is built and served
2. Configuration used by your codebase

### Configuration for how your app is built and served

This type of build-specific configuration is not used by your code, but is used to control the build system itself.
Configuration like this goes into Angular's
[workspace configuration](https://angular.io/guide/workspace-config#alternate-build-configurations). Instead of
rehashing existing documentation on this, this document will highlight how it relates to this subject. Namely, the
fact that in addition to specifying *HOW* the app is built for each build configuration, the workspace configuration
allows mapping each build configuration to a separate environment configuration file for your codebase as well. It
also allows for making separate dev-server configurations in case you need to run it differently.

Therefore, each build configuration in the workspace configuration file is a tuple of
(how-to-build, environment-file-for-codebase), and you'll need a separate configuration for each combination.

## Angular's out-of-the-box environment configuration

### When it works well

This setup works quite well for configuration that's shared among all instances of an environment, like the following
examples:

- **test** environment always builds without source maps, disables animations, uses a recaptcha test key, and disables
  analytics
- **dev** environment always builds with source maps, enables animations, uses a recaptcha live key, and disables
  analytics
- **qa** environment always builds with source maps, enables animations, uses a recaptcha live key, and disables
  analytics
- **prod** environment always builds without source maps, enables animations, uses a recaptcha live key, and enables
  analytics

### Limitations of Angular's `fileReplacements`

But for certain deployment-specific configuration, things start to get really hairy, like in these examples:

- QA build configuration needs to be built for local deployment, deployment to a server on the internet for QA
  purposes, and also deployment to another server on the internet for staging purposes
- Production build needs multiple different deployments of the same app to different servers

These cases can cause problems when:

- Each deployment needs a separate API URL
- Each deployment needs a separate URL for building its own URLs to where it's deployed
- Each deployment needs separate API keys, bucket names, etc

You *COULD* start creating separate configurations for each deployment, each with its own `fileReplacements`, but that
would be really messy.

### Workarounds that don't work well

One workaround would be to keep such configurations as globals in a separate deployment-specific script file. But
that's pretty messy too. More importantly, there are limitations to where they can be used. For example, because
of AOT, such configuration variables cannot be used in Angular's decorators, because they're not statically
analyzable (i.e. their values knowable at build-time). So it would be better if we can keep everything in the same place.

### ngx-rocket to the rescue

The ngx-rocket `env` task solves this problem really well, and avoids the need for separate `environment.ts` files for
deployment-specific configuration.

To add a deployment-specific configuration:

1. edit the existing `environment.ts` files for whichever environments you'd like to make that variable
   deployment-specific for by having it come from the imported "env" object - pro tip: you can even make it fall
   back to an environment-based default and still be statically analyzable!
2. add that variable name to the npm script's `env` task

Now, as long as you have that environment variable set in the shell running the build, the `env` task will save it into
the `.env.ts` file before building.

If you really want, you can take things even further to the twelve-factor extreme, and you can even eliminate the
need for `fileReplacements` entirely, and make all configuration come from environment variables. Whether this will be
the right approach for your project will be up to you.

This makes separate deployments awesome and flexible, but unfortunately makes things a little bit of a hassle for your
local development, test, etc. environments because you have the burden of providing all those keys, settings, etc. as
environment variables.

To avoid having to do that, you'll can create a .gitignore'd `.env` file with all the variables set, and source it
with your shell (e.g. `source .env.sh && npm env` in bourne-like shells or `env.bat; npm env` in windows).
```shell
# bourne-like .env.sh
export BROWSER_URL=localhost:4200
```
```shell
REM windows env.bat
SET BROWSER_URL=localhost:4200
```

Luckily for us, there's a package called `dotenv-cli` that uses the `dotenv` package and does this in a cleaner and
cross-platform way and comes with even more bells and whistles. You should use that instead, and make your env file
like this instead:
```shell
BROWSER_URL=localhost:4200
```

## When you can use environment variables directly without ngx-rocket `env`

As a sidenote, ngx-rocket `env` isn't used for the proxy config file, because it isn't built and ran separately.
Fortunately, for that same reason, you can directly use `process.env` within the proxy config file to avoid having
separate proxy configs in most cases.

On that same note, the `server.ts` for SSR builds can also access `process.env` as it's set at runtime. But keep in mind
that it stops there - the app itself is built, so even in SSR the client app can't access process environment variables.

## Security Considerations

Never forget that your entire Angular app goes to the client, including its configuration, including the environment
variables you pass to the env task! As usual, you should **never add sensitive keys or secrets to the env task**.

Finally, if your Angular project is the client-side of a full-stack monorepo, make sure to keep the client-side `.env`
file separate from the server-side `.env` file, since your server-side is bound to have secrets.
