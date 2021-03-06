# ZCRM OAuth2 [![npm](https://img.shields.io/npm/v/npm.svg?style=flat-square)](https://www.npmjs.com/package/npm) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/crmpartners/zcrm-oauth2/blob/master/LICENSE)

```shell
$ npm i -g zcrm-oauth2
```

CLI module built to simplify the generation of the `access token` and `refresh token` for self-client applications using **Zoho CRM API v2**. 

This can be a useful tool if you quickly want to have an access token to test or use the Zoho CRM APIs (using [Postman](https://www.getpostman.com/), for example)
and you don't want to generate the tokens manually or setting up any of the [Zoho SDKs](https://www.zoho.com/crm/help/api/v2/) environments.

Take a look to [the classic use case](#classic-use-case) for a quick _how to_ example.

Official Zoho documentation [here](https://www.zoho.com/crm/help/api/v2/).

## Table of contents

- [Installing / Getting started](#installing--getting-started)
- [Usage examples](#usage-examples)
- [Generating the access and refresh tokens](#generating-the-access-and-refresh-tokens)
- [Generating the access and refresh tokens without having the `grant code`](#generating-the-access-and-refresh-tokens-without-having-the-grant-code)
- [Refresh access token](#refresh-access-token)
- [Using `--file` instead of any option](#using---file-instead-of-any-option)
- [**Classic use case**](#classic-use-case)
- [Versioning](#versioning)
- [License](#license)

## Installing / Getting started

```shell
$ npm install -g zcrm-oauth2
```

To see all the CLI options:

```shell
$ zcrm-oauth2 -h
``` 

### Prerequisites

Node >= 4.0.0 is required.

## Usage examples

```shell
$ zcrm-oauth2 -h

Usage: zcrm-oauth2 [options]

  Options:

    --id <id>                  * client-id obtained from the connected app.
    --secret <secret>          * client-secret obtained from the connected app.
    --redirect <redirect>      * Callback URL that you registered. To generate <grant_token> is required "localhost".
    --code <grant_token>       If not present, will be generated. It requires to redirect to "localhost" to make it work.
    --refresh <refresh_token>  refresh-token used to generate new access tokens.
    --scope <scopes...>        List of scopes separated by ",". Default value is "ZohoCRM.modules.ALL".
    -f, --file <file>          File containing options parameters.
    -l, --location <location>  Zoho API authentication location. Default value is "eu".
    -o, --output <output>      Output file name.
    -V, --version              output the version number
    -h, --help                 output usage information

    * required fields.
```

If you have already generated the `grant token`, you can pass it using the `--code` option.
If no `--code` option is provided, the tool will generate the `grant code` for you.

### Generating the access and refresh tokens

When you have the `grant token` you just have to use the options `--code` followed by your `grant token`.

```shell
$ zcrm-oauth2 --id XXXXX --secret XXXXX --redirect http://your-redirect --code XXXXX
```

This will generate your tokens.

### Generating the access and refresh tokens without having the `grant code`

Example usage:

```shell
$ zcrm-oauth2 --id XXXXX --secret XXXXX --redirect http://localhost:8000/ 
```

> Generating the `grant code` automatically requires to set **http://localhost:[port]/** as redirect URL 
in you application configuration. 

For example:

```shell
$ zcrm-oauth2 --id XXXXX --secret XXXXX --redirect http://localhost:3333/ 
```

You can also specify the **scope** of the `grant code` specifying the privileges for the application using 
the `--scope` option followed by the list of privileges. 

The default value is `ZohoCRM.modules.ALL` that will give you full access to the CRM.

To obtain access to the _Leads_ and _Accounts_ modules only, for example:

```shell
$ zcrm-oauth2 --id XXXXX --secret XXXXX --redirect http://localhost:8000/ --scope ZohoCRM.modules.Leads,ZohoCRM.modules.Accounts
```

### Refresh access token

You can provide the `--refresh` option followed by the `refresh token` that you generated in the previous step to
generate new access tokens when the current ones are past the expiry time.

```shell
$ zcrm-oauth2 --id XXXXX --secret XXXXX --redirect http://localhost:8000/ --refresh XXXXX
``` 

### Using `--file` instead of any option

If you have to set a lot of different options the line you have to type can quickly become pretty long.

For this reason, you can use the option `-f` or `--file` followed by the name of a **JSON** file containing 
all the options that you should pass as agruments.

For example, the following line:

```shell
$ zcrm-oauth2 --id XXXXX --secret XXXXX --redirect http://localhost:2345 --scope ZohoCRM.modules.Leads,ZohoCRM.modules.Accounts --location com
```

can be simplified:

```shell
$ zcrm-oauth2 -f ./auth.json
```

and the `./auth.json` file should look like this:

```
{
    "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "redirect": "http://localhost:2345",
    "scope": "ZohoCRM.modules.Leads,ZohoCRM.modules.Accounts",
    "location": "com"
}
```

This can help you to keep your parameters organized in a more readable way.

The keys you have to use in the json file are the names of the options without `--`. 

> For example, for `--redirect` you use `redirect`, for `--secret` you use `secret`, ...      

### Classic use case

You want to quickly have access and refresh token for your **self-client** app and you don't want to follow 
the two/step procedure described [here](https://www.zoho.com/crm/help/api/v2/#oauth-request) to generate the tokens.

If you want to generate automatically the grant token, you need to run this tool in a machine with a browser.

Follow this steps:

1. Go to <https://accounts.zoho.com/developerconsole> and create your app. Use **http://localhost:8000/** as redirect URL
![_1](https://user-images.githubusercontent.com/30785662/40118638-c6b709e8-591a-11e8-80f8-0221edfdf768.gif)

2. Copy your _client id_ and _client secret_ and paste it in a JSON file called "auth.json"
![_2](https://user-images.githubusercontent.com/30785662/40118645-c9b70ad0-591a-11e8-87a9-6d2ce68c42e5.gif)

3. Add to the JSON file the additional options you need to run for the specific authentication
![_3](https://user-images.githubusercontent.com/30785662/40118648-cc002b32-591a-11e8-95b7-8837e2f36a98.gif)

4. Run the tool and get the access and refresh tokens!
![_4](https://user-images.githubusercontent.com/30785662/40118654-cf351f42-591a-11e8-9676-47aa8d9c5806.gif)

## Versioning

We use [SemVer](http://semver.org/) for versioning.

### Setting up Dev

Everything you need to do is:

```shell
$ git clone https://github.com/crmpartners/zcrm-oauth2
$ cd zcrm-oauth2/
$ npm install
```

That's it. You can start working on it!

## License

ZCRM OAuth2 is an open source software [licensed as MIT](https://github.com/crmpartners/zcrm-oauth2/blob/master/LICENSE).
