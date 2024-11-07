import { Request, Response } from 'express';
import { DailyMetric, DotcomChatMetrics, DotcomChatModelStats, Editor, IdeChatEditor, IdeChatMetrics, IdeChatModelStats, IdeCompletions, LanguageStats, ModelStats, PrMetrics, PrModelStats, PrRepository } from '../models/metrics.model.new';
import { Op } from 'sequelize';

class MetricsControllerNew {
  // Get all metrics 📊
  async getAllMetrics(req: Request, res: Response): Promise<void> {
    const { type, since, until, editor, language, model } = req.query;
    try {
      // consider the fact that these are UTC dates...
      const dateFilter: any = { };
      if (since) {
        dateFilter[Op.gte] = new Date(since as string);
      }
      if (until) {
        dateFilter[Op.lte] = new Date(until as string);
      }

      const include = [];
      const types = type ? (type as string).split(/[ ,]+/) : [];
      if (types.length === 0 || types.includes('copilot_ide_code_completions')) {
        include.push({
          attributes: { exclude: ['id', 'daily_metric_id'] },
          model: IdeCompletions,
          as: 'copilot_ide_code_completions',
          include: [{
            attributes: { exclude: ['id', 'ideCompletionId'] },
            model: Editor,
            as: 'editors',
            where: editor ? { name: editor } : {},
            required: false,
            include: [{
              attributes: { exclude: ['id', 'editorId'] },
              model: ModelStats,
              as: 'models',
              where: model ? { name: model } : {},
              required: false,
              include: [{
                attributes: { exclude: ['id', 'modelStatId'] },
                model: LanguageStats,
                as: 'languages',
                where: language ? { name: language } : {},
                required: false,
              }]
            }]
          }]
        });
      }
      if (types.length === 0 || types.includes('copilot_ide_chat')) {
        include.push({
          attributes: { exclude: ['id', 'daily_metric_id'] },
          model: IdeChatMetrics,
          as: 'copilot_ide_chat',
          include: [{
            attributes: { exclude: ['id', 'chat_metrics_id'] },
            model: IdeChatEditor,
            as: 'editors',
            where: editor ? { name: editor } : {},
            required: false,
            include: [{
              attributes: { exclude: ['id', 'editor_id'] },
              model: IdeChatModelStats,
              as: 'models',
              where: model ? { name: model } : {},
              required: false,
            }]
          }]
        });
      }
      if (types.length === 0 || types.includes('copilot_dotcom_chat')) {
        include.push({
          attributes: { exclude: ['id', 'daily_metric_id'] },
          model: DotcomChatMetrics,
          as: 'copilot_dotcom_chat',
          include: [{
            attributes: { exclude: ['id', 'chat_metrics_id'] },
            model: DotcomChatModelStats,
            as: 'models',
            where: model ? { name: model } : {},
            required: false,
          }]
        });
      }
      if (types.length === 0 || types.includes('copilot_dotcom_pull_requests')) {
        include.push({
          attributes: { exclude: ['id', 'daily_metric_id'] },
          model: PrMetrics,
          as: 'copilot_dotcom_pull_requests',
          include: [{
            attributes: { exclude: ['id', 'pr_metrics_id'] },
            model: PrRepository,
            as: 'repositories',
            include: [{
              attributes: { exclude: ['id', 'repository_id'] },
              model: PrModelStats,
              as: 'models',
              where: model ? { name: model } : {},
              required: false,
            }]
          }]
        });
      }
      const metrics = await DailyMetric.findAll({
        where: Object.getOwnPropertySymbols(dateFilter).length ? { date: dateFilter } : {},
        include
      });
      res.status(200).json(metrics); // 🎉 All metrics retrieved!
    } catch (error) {
      console.log(error)
      res.status(500).json(error); // 🚨 Error handling
    }
  }

  async getMetricsByDay(req: Request, res: Response): Promise<void> {
    const { date } = req.params;
    try {
      const metrics = await DailyMetric.findOne({
        where: { date: date },
        include: [{
          attributes: { exclude: ['id'] },
          model: IdeCompletions,
          as: 'copilot_ide_code_completions',
          required: false,
          include: [{
            attributes: { exclude: ['id', 'ideCompletionId'] },
            model: Editor,
            as: 'editors',
            include: [{
              attributes: { exclude: ['id', 'editorId'] },
              model: ModelStats,
              as: 'models',
              include: [{
                attributes: { exclude: ['id', 'modelStatId'] },
                model: LanguageStats,
                as: 'languages',
              }]
            }]
          }]
        }]
      });
      res.status(200).json(metrics); // 🎉 All metrics retrieved!
    } catch (error) {
      console.log(error)
      res.status(500).json(error); // 🚨 Error handling
    }
  }

  async getMetricsByEditor(req: Request, res: Response): Promise<void> {
    const { editor } = req.params;
    try {
      const metrics = await DailyMetric.findAll({
        include: [{
          attributes: { exclude: ['id'] },
          model: IdeCompletions,
          as: 'copilot_ide_code_completions',
          required: false,
          include: [{
            attributes: { exclude: ['id', 'ideCompletionId'] },
            model: Editor,
            as: 'editors',
            where: { name: editor },
            include: [{
              attributes: { exclude: ['id', 'editorId'] },
              model: ModelStats,
              as: 'models',
              include: [{
                attributes: { exclude: ['id', 'modelStatId'] },
                model: LanguageStats,
                as: 'languages',
              }]
            }]
          }]
        }]
      });
      res.status(200).json(metrics); // 🎉 All metrics retrieved!
    } catch (error) {
      console.log(error)
      res.status(500).json(error); // 🚨 Error handling
    }
  }

}

export default new MetricsControllerNew();