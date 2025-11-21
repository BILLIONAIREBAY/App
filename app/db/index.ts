import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import * as Crypto from 'expo-crypto';

import { schema } from './schema';
import User from './models/User';
import Item from './models/Item';
import Charity from './models/Charity';
import WhisperRequest from './models/WhisperRequest';

setGenerator(() => Crypto.randomUUID());

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'billionairebay_luminescence',
  jsi: true,
});

export const database = new Database({
  adapter,
  modelClasses: [User, Item, Charity, WhisperRequest],
});
