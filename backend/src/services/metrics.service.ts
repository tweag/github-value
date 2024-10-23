import cron from "node-cron";
import dotenv from "dotenv";
import { Metrics, Breakdown } from '../models/metrics.model';
import github from "./octokit";

dotenv.config();

export async function queryCopilotMetrics() {
  try {
    const octokit = await github.getInstallationOctokit(
      Number(process.env.GITHUB_APP_INSTALLATION_ID)
    );
    const response = await octokit.rest.copilot.usageMetricsForOrg({
      org: "github"
    });
    const metricsArray = response.data;

    for (const metrics of metricsArray) {
      const [createdMetrics, created] = await Metrics.findOrCreate({
        where: { day: metrics.day },
        defaults: {
          totalSuggestionsCount: metrics.total_suggestions_count,
          totalAcceptancesCount: metrics.total_acceptances_count,
          totalLinesSuggested: metrics.total_lines_suggested,
          totalLinesAccepted: metrics.total_lines_accepted,
          totalActiveUsers: metrics.total_active_users,
          totalChatAcceptances: metrics.total_chat_acceptances,
          totalChatTurns: metrics.total_chat_turns,
          totalActiveChatUsers: metrics.total_active_chat_users,
        }
      });

      if (!created) {
        console.log(`Metrics for ${metrics.day} already exist. Updating... ✏️`);
    
        await createdMetrics.update({
          totalSuggestionsCount: metrics.total_suggestions_count,
          totalAcceptancesCount: metrics.total_acceptances_count,
          totalLinesSuggested: metrics.total_lines_suggested,
          totalLinesAccepted: metrics.total_lines_accepted,
          totalActiveUsers: metrics.total_active_users,
          totalChatAcceptances: metrics.total_chat_acceptances,
          totalChatTurns: metrics.total_chat_turns,
          totalActiveChatUsers: metrics.total_active_chat_users,
        });
    
        await Breakdown.destroy({ where: { metricsDay: metrics.day } });
      }

      if (!metrics.breakdown) {
        console.log(`No breakdown data for ${metrics.day}. Skipping...`);
        continue;
      }
      for (const breakdown of metrics.breakdown) {
        await Breakdown.create({
          metricsDay: createdMetrics.dataValues.day,
          language: breakdown.language,
          editor: breakdown.editor,
          suggestionsCount: breakdown.suggestions_count,
          acceptancesCount: breakdown.acceptances_count,
          linesSuggested: breakdown.lines_suggested,
          linesAccepted: breakdown.lines_accepted,
          activeUsers: breakdown.active_users,
        });
      }
    }

    console.log("Metrics stored successfully! 🎉📊");
  } catch (error) {
    console.error("Error querying Copilot metrics: ", error); // 🚨❌
  }
}

// Schedule the task to run daily at midnight
cron.schedule('0 0 * * *', queryCopilotMetrics);

console.log("Scheduler setup complete! ⏰");