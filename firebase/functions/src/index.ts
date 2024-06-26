/* eslint-disable @typescript-eslint/no-explicit-any */

import admin = require("firebase-admin")
import * as serviceAccount from './serviceAccountKey.json';
// import tts = require('./tts');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)}
);

exports.api = require('./tts')
