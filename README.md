
# Shopify Embedded App Starter

A boilerplate project to get you quickly building Shopify Embedd Apps using Nodejs / Mongo / React stack

## Features
- Automated script-tag, webhook and billing setup
- Support for single or recurring charge application with free trial support
- HMAC verified routes for all endpoint including assets
- Public website for marketing efforts and information
- ReactJS / Polaris front end stack with simple state management
- Automatically deny access to assets for unpaid accounts (script-tags, proxies, images etc) 
- LiveChat integration (optional)


## Todo

- Provide a boilerplate for the website route
- Unit testing
- Support for multiple script-tag entries
- Support for various script-tag display scopes (support only "all")
- Complete documentation
  - Explaining the folder structure, routes, models and middleware
  - Examples of various billing states with screenshots (free trial, prepaid, overdue)
  - Webhook information
  - Creating API endpoints
  - Using the provided Shopify-API-Node 
  - Script Tags
    - Calling API endpoints with hmac validation
    - loading CSS, Images and other external assets
  - Proxies
    - Using external assets

## Getting Started

### Requirements

- Nodejs
- Mongodb
- Npm
- Ngrok

### Installation

Copy the repository to your system go to the folder and run ```npm install```

### Start Ngrok

Ngrok will expose your local server to a temporary domain which you can test and view your app from on Shopify. Download and open Ngrok. From the terminal ```ngrok http 3000```. Once started, copy the https address.

### Create Shopify App

Login to your Shopify developer account and create a new app. Name it what you'd like. For the app url use the Ngrok https address followed by /app. For example ```https://fea9b7f7.ngrok.io/app```

Go to the "app info" tab and add the install install callback route to the "Whitelisted redirection URL(s)" textarea. This is the ngrok address followed by /install/callback. 
For example: ```https://fea9b7f7.ngrok.io/install/callback```

### Environment Configuration

Edit ```config/env.js```  to include you're app's configuration. At minimum the URL needs to be set to the ngrok root https address.

```NAME``` - The name of your application
```PORT``` - The port to run your application on
```DATABASE``` - The mongodb database to connect to
```URL``` - The app url. Enter the root ngrok https address here
```SHOPIFY_API_KEY``` - The api key. See "app info" tab in Shopify app page
```SHOPIFY_API_SECRET``` - The api secret.  See "app info" tab in Shopify app page
```SHOPIFY_APP_SCOPE``` - The app scope(s) that will be needed.
```LIVECHAT_API_KEY``` - Livechat API Key (optional)
```APPLICATION_CHARGE``` - The application cost (string) or null if it's free
```FREE_TRIAL_DURATION``` - The amount of free trial days. Use zero if none offered
```TEST_BILLING``` - Set this to true for development. Explicit instead of using NODE_ENV so you can test production builds without triggering real charges.
```DEFAULT_SETTINGS``` - The default settings for your application. The settings can be sent to script-tags or used by the application to provide functionality.

### Start Development Server

In the command line go to the project folder and run ```npm run dev```

### App Installation

Now that the app is running, go to the ngrok address followed by /install?shop=shopname where shop is the name of your development store. For example if I have a test store at sometestshop.myshopify.com. The install url is: ```https://fea9b7f7.ngrok.io/install?shop=sometestshop```

### Confirm Billing if Needed

The app does not use Shopify's built-in free trial mechanism for recurring billing. Instead it provides a self managed solution for both recurring and single charge billing. 

If offering a free trial the user will be forwarded directly to the embedded app upon installation. 

If the app has a cost and no free trial is offered the user will be prompted to confirm billing. Once confirmed the user is forwarded to the app.

Note: The system also checks for prepaid days. This is when a user has paid for a month then uninstalled and re-installed during the same billing cycle. So if Bob pays for 30 days on the 1st, uninstalls on the 7th then reinstalls on the 15th... he has 15 days left. In this case, the user will be forwarded to the app with 15 days left of "prepaid days".

### ScriptTag Hello World

The demo simply installs a script-tag that adds a "Hello World" banner to the document body. Go to the embedded app in your test store to toggle the settings and preview the store to see to see the app in action. 

### Proxy Hello World

To add the hello world proxy go to the app's "Extensions" tab. Under the App Proxy provide the following options:
- sub path prefix ```apps```
- sub path ```hello-world```
- proxy url ```https://fea9b7f7.ngrok.io/assets/app/proxy```

Now open your test store to the apps/hello-world route and you'll see your proxy page. ```https://sometestshop.myshopify.com/apps/hello-world```
