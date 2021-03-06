#!/usr/bin/env node
'use strict';

const program = require('commander');
const url = require('url');
const request = require('request');
const fs = require('fs');
const chalk = require('chalk');
const packageJSON = require('./package');
const makeServer = require('./server');

program
  .usage('[options]')
  .option('--id <id>',
    `${chalk.green('*')} client-id obtained from the connected app.`)
  .option('--secret <secret>',
    `${chalk.green('*')} client-secret obtained from the connected app.`)
  .option('--redirect <redirect>',
    `${chalk.green('*')} Callback URL that you registered. To generate <grant_token> is required "localhost".`)
  .option('--code <grant_token>',
    'If not present, will be generated. It requires to redirect to "localhost" to make it work.')
  .option('--refresh <refresh_token>',
    'refresh-token used to generate new access tokens.')
  .option('--scope <scopes...>',
    'List of scopes separated by ",". Default value is "ZohoCRM.modules.ALL".',
    scope => scope.split(',').forEach(scope=>{scope.trim()}).join(','))
  .option('-f, --file <file>',
    'File containing options parameters.')
  .option('-l, --location <location>',
    'Zoho API authentication location. Default value is "eu".')
  .option('-o, --output <output>',
    'Output file name.')
  .on('-h, --help', () => console.log(`
    ${chalk.green('* required fields.')}
    
    You can find more about the usage on the official repository:
      ${chalk.cyan('https://github.com/crmpartners/zcrm-oauth2')}
      
    If you have any problems, do not hesitate to file an issue:
      ${chalk.cyan('https://github.com/crmpartners/zcrm-oauth2/issues')}
     `))
  .version(packageJSON.version)
  .parse(process.argv);

if (!program.args.length) program.help();

const options = validateOptions(program),
  id = options.id,
  secret = options.secret,
  redirect = options.redirect,
  refresh = options.refresh || false,
  code = options.code || false,
  scope = options.scope || 'ZohoCRM.modules.ALL',
  location = options.location || 'eu',
  output = options.output || generateOutputFileName();

if (refresh)
  refreshToken();
else if (code)
  getTokens(code);
else
  makeServer(
    { id, location, scope, redirect },
    getTokens
  );

/**
 * Verify that all the required options have been set.
 * If the options are imported from file, joins the JSON obj with 'program'.
 * @param {Object} program
 * @returns {Object} - list of options
 */

function validateOptions(program) {
  const importFromFile = program.file || false;
  let validation = importFromFile ? validateFile(importFromFile) : program;

  // check if any of the required options is undefiend
  const requiredOptions = ['id', 'secret', 'redirect'];
  const missing = requiredOptions.filter(item => typeof validation[item] === 'undefined');
  if (missing.length)
    error(
      `You must specify valid ${missing.join(', ')}.`,
      `Run ${chalk.cyan(`${packageJSON.name} --help`)} to see all options.`
    );

  // check if user wants to generate the grant code but is using another redirect rather then "localhost"
  if (!validation.code && validation.redirect && url.parse(validation.redirect).hostname !== 'localhost')
    error(`You must use a "localhost" redirect if you want to generate the code "grant_token".`);

  return Object.assign({}, program, validation);
}

/**
 * Verify that the file passed as option is an existing file, is readable and
 * can be parse as JSON file.
 * @param {string} file - file path given with --file option
 * @returns {Object} - object parsed from JSON
 */

function validateFile(file) {
  try {
    const stats = fs.lstatSync(file);

    if (!stats.isFile())
      error(`${chalk.bold.white(file)} doesn't seem to be a file.`);

    const fileContent = fs.readFileSync(file);

    try {
      return JSON.parse(fileContent);
    } catch (e2) {
      console.log(
        `${chalk.bgRed('Error parsing')} ${chalk.bold.white(file)}`
      );

      error(e2.message);
    }
  } catch (e) {
    console.log(
      `${chalk.bgRed('Error reading')} ${chalk.bold.white(file)}.`
    );

    error(e.message);
  }
}

/**
 * Generates an output file named based on the current datetime.
 * @returns {string} - generated output file name
 */

function generateOutputFileName() {
  const now = new Date();
  const twoDigits = data => `0${data}`.slice(-2);
  const date = `${now.getFullYear()}-${twoDigits(now.getMonth() + 1)}-${twoDigits(now.getDate())}`;
  const time = `${twoDigits(now.getHours())}-${twoDigits(now.getMinutes())}-${twoDigits(now.getSeconds())}`;
  return `out-${date}T${time}.json`;
}

/**
 * Helper function that exits the process with code 1.
 * @param {string} error - error message
 * @param {string=} suggestion - optional suggestion string
 */

function error(error, suggestion) {
  console.log(chalk.bgRed(error));

  if (typeof suggestion !== 'undefined') {
    console.log();
    console.log(suggestion);
  }

  process.exit(1);
}

/**
 * Make request to generate access and refresh tokens.
 * @param {string} code - grant_token required to generate access and refresh tokens
 */

function getTokens(code) {
  makeRequest({
    code,
    redirect_uri: redirect,
    client_id: id,
    client_secret: secret,
    grant_type: 'authorization_code'
  });
}

/**
 * Make request to refresh access token.
 */

function refreshToken() {
  makeRequest({
    refresh_token: refresh,
    client_id: id,
    client_secret: secret,
    grant_type: 'refresh_token'
  });
}

/**
 * Make a POST request to OAuth2 Zoho CRM OAuth endpoint.
 * @param {object} qs - query string
 */

function makeRequest(qs) {
  request.post(
    {
      url: `https://accounts.zoho.${location}/oauth/v2/token`,
      qs
    },
    (err, resp, body) => {
      if (err)
        error(`Error in Zoho response: ${err.message}`);

      writeOutputFile(body);
    }
  );
}

/**
 * Write the content into output file.
 * @param {string} content
 */

function writeOutputFile(content) {
  content = JSON.stringify(JSON.parse(content), null, 4); // formatting JSON
  fs.writeFileSync(output, content);
  console.log(content);
  console.log();
  console.log(chalk.cyan(`Result sucessfully exported in ${chalk.bold.white(output)}.`));
  process.exit(0);
}
