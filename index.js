#!/usr/bin/env node
'use strict';

var currentNodeVersion = process.versions.node;
var semVer = currentNodeVersion.split('.');
var majorVersion = semVer[0];

if (majorVersion < 4) {
  console.error(
    'You are running Node ' + currentNodeVersion + '\n' +
    'zcrm-oauth2 requires Node 4 or higher.\n' +
    'Please update your version of Node.'
  );

  process.exit(1);
}

require('./ZCRMOAuth2');
