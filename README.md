# ZCRM OAuth2 [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/crmpartners/zcrm-oauth2/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

CLI module built to simplify the generation of the `access token` and `refresh token` for self-client application for  **Zoho CRM API v2**. 

This can be a useful tools if you want to generate quickly an access token to test or make some calls to the Zoho CRM APIs (using [Postman](https://www.getpostman.com/), for example)
and you don't want to generate the tokens manually or setting up any of the [Zoho SDKs](https://www.zoho.com/crm/help/api/v2/) environments.

Take a look to [the classic use case](#classic-use-case) for a quick _how to_ explanation.

## Table of contents

- [Installing / Getting started](#installing--getting-started)
- [Usage examples](#usage-examples)
- [Generating the `access token` and `refresh token`](#generating-the-access-token-and-refresh-token)
- [Generating the `access token` and `refresh token` without having the `grant code`](#generating-the-access-token-and-refresh-token-without-having-the-grant-code)
- [Using `--file` instead of options](#using---file-instead-of-options)
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

Required Node >= v4.0.0

### Setting up Dev

Everything you need to do is:

```shell
$ git clone https://github.com/crmpartners/zcrm-oauth2
$ cd zcrm-oauth2/
$ npm install
```

That's it. You can start working on it!

## Usage examples

```shell
$ zcrm-oauth2 -h

Usage: zcrm-oauth2 [options]

  Options:

    --id <id>                  * client-id obtained from the connected app.
    --secret <secret>          * client-secret obtained from the connected app.
    --redirect <redirect>      * Callback URL that you registered. To generate <grant_token> is required "localhost".
    --code <grant_token>       If not present, will be generated. It requires to redirect to "localhost" to make it work.
    --scope <scopes...>        List of scopes separated by ",". Default value is "ZohoCRM.modules.ALL".
    -p, --port <port>          The local server port to generate <grant_toke>. Default value is "8000".
    -f, --file <file>          File containing options parameters.
    -l, --location <location>  Zoho API authentication location. Default value is "eu".
    -o, --output <output>      Output file name.
    -V, --version              output the version number
    -h, --help                 output usage information

    * required fields.
```

You can use this tool to generate the `access token` and the `refresh token` if you have already generated your
own `grant code` or not. If the `--code` option (that is the `grant code`) will not be provided, the tool will generate
it for you.

### Generating the `access token` and `refresh token`

If you already have generated by yourself the `grant token` you just have to use the options `--code` followed
by your `grant token`.

```shell
$ zcrm-oauth2 --id XXXXX --secret XXXXX --redirect http://your-redirect --code XXXXX
```

This will generate your tokens.

### Generating the `access token` and `refresh token` without having the `grant code`

Example usage:

```shell
$ zcrm-oauth2 --id XXXXX --secret XXXXX --redirect http://localhost:8000/ 
```

Note:

> If you want to generate the `grant code` automatically with this tools you need to set **http://localhost:[port]/** 
as redirect URL in you application configuration. The default port is `8000`, but you can set your own value passing
the option `--port`.

Generating the `grant code` using a different port than 8000:

```shell
$ zcrm-oauth2 --id XXXXX --secret XXXXX --redirect http://localhost:3333/ -p 3333
```

You can also specify the **scope** of the `grant code` specifying the privileges that the application will need using 
the `--scope` option followed by the list of privileges. 

The default value is `ZohoCRM.modules.ALL` that will grant you full access to the CRM.

If you want, for example, obtain access to the `Leads` and `Accounts` modules only, you will just have to type:

```shell
$ zcrm-oauth2 --id XXXXX --secret XXXXX --redirect http://localhost:8000/ --scope ZohoCRM.modules.Leads,ZohoCRM.modules.Accounts
```

### Using `--file` instead of options

The command that you have to type can become pretty long quickly.

For this reason, you can use the option `-f` or `--file` followed by the file name containing all the options that you should
pass as agruments via CLI.

The file must follow the **JSON** syntax.

For example, the following line of execution:

```shell
$ zcrm-oauth2 --id XXXXX --secret XXXXX --redirect http://localhost:2345 --port 2345 --scope ZohoCRM.modules.Leads,ZohoCRM.modules.Accounts --location com
```

can become:

```shell
$ zcrm-oauth2 -f ./auth.json
```

and the `./auth.json` file should look like this:

```
{
    "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "redirect": "http://localhost:2345",
    "port": "2345",
    "scope": "ZohoCRM.modules.Leads,ZohoCRM.modules.Accounts",
    "location": "com"
}
```

This can help you in keeping your parameters organized and could be easier if you need to edit them.

Note that the keys in the json file are the words without `--` in the options. For example, for `--port` you use `port` 
and so on.      

### Classic use case

You want to have an access and refresh token as fast as possible for your **self-client** app and you don't
want to follow the guidelines described [here](https://www.zoho.com/crm/help/api/v2/#oauth-request) to generate the grant token first.

If you want to generate automatically the grant token, you need to run this tool in a machine
with a browser installed.

Follow this steps:

1. Go to <https://accounts.zoho.com/developerconsole> and create your app. 
Use **http://localhost:8000/** as redirect URL
![_1](https://user-images.githubusercontent.com/30785662/40118638-c6b709e8-591a-11e8-80f8-0221edfdf768.gif)

2. Copy your _client id_ and _client secret_ and paste it in a JSON file "auth.json"
![_2](https://user-images.githubusercontent.com/30785662/40118645-c9b70ad0-591a-11e8-87a9-6d2ce68c42e5.gif)

3. Add to the JSON file the additional options you need to run for the specific authentication
![_3](https://user-images.githubusercontent.com/30785662/40118648-cc002b32-591a-11e8-95b7-8837e2f36a98.gif)

4. Run the tool and get the access and refresh tokens!
![_4](https://user-images.githubusercontent.com/30785662/40118654-cf351f42-591a-11e8-9676-47aa8d9c5806.gif)

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## License

ZCRM OAuth2 is an open source software [licensed as MIT](https://github.com/crmpartners/zcrm-oauth2/blob/master/LICENSE).
