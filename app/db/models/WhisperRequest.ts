import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class WhisperRequest extends Model {
  static table = 'whisper_requests';

  @field('user_id') userId!: string;
  @field('text_query') textQuery!: string;
  @field('ai_analysis_json') aiAnalysisJson!: string;
  @field('status') status!: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
