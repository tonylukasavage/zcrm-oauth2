#!/usr/bin/env node
'use strict';

const program = require('commander');
const url = require('url');
const request = require('request');
const fs = require('fs');
const packageJSON = require('./package');
const makeServer = require('./server');

program
  .usage('[options]')
  .option('--id <id>',
    '* client-id obtained from the connected app.')
  .option('--secret <secret>',
    '* client-secret obtained from the connected app.')
  .option('--redirect <redirect>',
    '* Callback URL that you registered. To generate <grant_token> is required "localhost".')
  .option('--code <grant_token>',
    'If not present, will be generated. It requires to redirect to "localhost" to make it work.')
  .option('--scope <scopes...>',
    'List of scopes separated by ",". Default value is "ZohoCRM.modules.ALL".',
    scope => scope.split(',').trim().join(','))
  .option('-p, --port <port>',
    'The local server port to generate <grant_toke>. Default value is "8000".')
  .option('-f, --file <file>',
    'File containing options parameters.')
  .option('-l, --location <location>',
    'Zoho API authentication location. Default value is "eu".')
  .option('-o, --output <output>',
    'Output file name.')
  .on('--help', () => console.log(`
    * required fields.
    `))
  .version(packageJSON.version)
  .parse(process.argv);

const options = validateOptions(program),
  id = options.id,
  secret = options.secret,
  redirect = options.redirect,
  code = options.code || false,
  scope = options.scope || 'ZohoCRM.modules.ALL',
  port = options.port || 8000,
  location = options.location || 'eu',
  output = options.output || makeOutputFileName();

if (code)
  getOAuth(code);
else
  makeServer(
    { id, location, scope, port },
    getOAuth
  );

function validateOptions(program) {
  const importFromFile = program.file || false;
  let validate = importFromFile ? validateFile(importFromFile) : program;

  const required = ['id', 'secret', 'redirect'];

  // check if any of the required fields id undefiend
  const missing = required.filter(item => typeof validate[item] === 'undefined');

  if (missing.length)
    error(`You must specify valid ${missing.join(', ')}`);

  // check if user wants to generate code but is using another redirect then "localhost"
  if (!validate.code && validate.redirect && url.parse(validate.redirect).hostname !== 'localhost')
    error(`You must use a "localhost" redirect if you want to generate the code "grant_token".`);

  return Object.assign({}, program, validate);
}

function makeOutputFileName() {
  const now = new Date();
  const twoDigits = data => `0${data}`.slice(-2);
  const date = `${now.getFullYear()}-${twoDigits(now.getMonth() + 1)}-${twoDigits(now.getDate())}`;
  const time = `${twoDigits(now.getHours())}-${twoDigits(now.getMinutes())}-${twoDigits(now.getSeconds())}`;
  return `out-${date}T${time}.json`;
}

function validateFile(file) {
  try {
    const stats = fs.lstatSync(file);

    if (!stats.isFile())
      error(`'${file}' doesn't seem to be a file.`);

    const fileContent = fs.readFileSync(file);

    try {
      return JSON.parse(fileContent);
    } catch (e2) {
      console.log(`Error parsing ${file}`);
      error(e2.message);
    }
  } catch (e) {
    console.log(`Error reading ${file}.`);
    error(e.message);
  }
}

function error(error) {
  console.log(error);
  process.exit(1);
}

function getOAuth(code) {
  request.post(`https://accounts.zoho.${location}/oauth/v2/token?code=${code}&redirect_uri=${redirect}&client_id=${id}&client_secret=${secret}&grant_type=authorization_code`,
    (err, resp, body) => {
      if (err)
        error(`Error in Zoho response: ${err.message}`);

      writeOutputFile(body);
    });
}

function writeOutputFile(content) {
  content = JSON.stringify(JSON.parse(content), null, 4); // formatting JSON
  fs.writeFileSync(output, content);
  console.log(content);
  console.log(`Result sucessfully exported in '${output}'.`);
  process.exit(0);
}