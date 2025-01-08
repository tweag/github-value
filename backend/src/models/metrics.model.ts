type MetricDailyResponseType = {
  date: string;
  total_active_users: number;
  total_engaged_users: number;
  copilot_ide_code_completions?: MetricIdeCompletionsType;
  copilot_dotcom_pull_requests?: MetricPrMetricsType;
  copilot_dotcom_chat?: MetricDotcomChatMetricsType;
  copilot_ide_chat?: MetricIdeChatMetricsType;
}

type MetricDailyType = {
  org: string;
  team?: string;
  date: Date;
  total_active_users: number;
  total_engaged_users: number;
  copilot_ide_code_completions?: MetricIdeCompletionsType;
  copilot_dotcom_pull_requests?: MetricPrMetricsType;
  copilot_dotcom_chat?: MetricDotcomChatMetricsType;
  copilot_ide_chat?: MetricIdeChatMetricsType;
}

type MetricIdeCompletionsType = {
  id?: number;
  total_engaged_users: number;
  total_code_acceptances: number;
  total_code_suggestions: number;
  total_code_lines_accepted: number;
  total_code_lines_suggested: number;
  daily_metric_id: Date;
  editors?: MetricEditorType[];
}

type MetricEditorType = {
  id?: number;
  name: string;
  total_engaged_users: number;
  total_code_acceptances: number;
  total_code_suggestions: number;
  total_code_lines_accepted: number;
  total_code_lines_suggested: number;
  ide_completion_id: number;
  models?: MetricModelStatsType[];
}

type MetricModelStatsType = {
  id?: number;
  name: string;
  is_custom_model: boolean;
  total_engaged_users: number;
  total_code_acceptances: number;
  total_code_suggestions: number;
  total_code_lines_accepted: number;
  total_code_lines_suggested: number;
  editor_id: number;
  languages?: MetricLanguageStatsType[];
}

type MetricLanguageStatsType = {
  id?: number;
  name: string;
  total_engaged_users: number;
  total_code_acceptances: number;
  total_code_suggestions: number;
  total_code_lines_accepted: number;
  total_code_lines_suggested: number;
  model_stat_id: number;
}

type MetricPrRepositoryType = {
  id?: number;
  name: string;
  total_engaged_users: number;
  total_pr_summaries_created: number;
  pr_metrics_id: number;
  models?: MetricPrModelStatsType[];
}

type MetricPrModelStatsType = {
  id?: number;
  name: string;
  is_custom_model: boolean;
  total_engaged_users: number;
  total_pr_summaries_created: number;
  repository_id: number;
}

type MetricPrMetricsType = {
  id?: number;
  total_engaged_users: number;
  total_pr_summaries_created: number;
  daily_metric_id: Date;
  repositories?: MetricPrRepositoryType[];
}

type MetricDotcomChatMetricsType = {
  id?: number;
  total_engaged_users: number;
  total_chats: number;
  daily_metric_id: Date;
  models?: MetricDotcomChatModelStatsType[];
}

type MetricDotcomChatModelStatsType = {
  id?: number;
  name: string;
  is_custom_model: boolean;
  total_engaged_users: number;
  total_chats: number;
  chat_metrics_id: number;
}

type MetricIdeChatMetricsType = {
  id?: number;
  total_engaged_users: number;
  total_chats: number;
  total_chat_copy_events: number;
  total_chat_insertion_events: number;
  daily_metric_id: Date;
  editors?: MetricIdeChatEditorType[];
}

type MetricIdeChatEditorType = {
  id?: number;
  name: string;
  total_engaged_users: number;
  total_chats: number;
  total_chat_copy_events: number;
  total_chat_insertion_events: number;
  chat_metrics_id: number;
  models?: MetricIdeChatModelStatsType[];
}

type MetricIdeChatModelStatsType = {
  id?: number;
  name: string;
  is_custom_model: boolean;
  total_engaged_users: number;
  total_chats: number;
  total_chat_copy_events: number;
  total_chat_insertion_events: number;
  editor_id: number;
}

export {
  MetricDailyType,
  MetricDailyResponseType
};