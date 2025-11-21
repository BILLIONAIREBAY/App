import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
import User from './models/User';
import Item from './models/Item';
import Charity from './models/Charity';
import WhisperRequest from './models/WhisperRequest';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'billionairebay_luminescence',
  jsi: true,
});

export const database = new Database({
  adapter,
  modelClasses: [User, Item, Charity, WhisperRequest],
});
