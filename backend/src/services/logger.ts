import bunyan from 'bunyan';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { Request, Response, NextFunction } from 'express';
import path from 'path';

const logsDir = path.resolve(__dirname, '../../logs');
if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
}

const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
export const appName = packageJson.name || 'GitHub Value';

const logger = bunyan.createLogger({
  name: appName,
  serializers: {
    ...bunyan.stdSerializers,
    req: (req: Request) => ({
      method: req.method,
      url: req.url,
           remoteAddress: req.connection.remoteAddress,
      remotePort: req.connection.remotePort
    }),
    res: (res: Response) => ({
      statusCode: res.statusCode
    })
  },
  streams: [
    {
      level: 'info',
      stream: process.stdout
    },
    {
      path: `${logsDir}/app.log`,
      period: '1d',
      count: 14
    }
  ]
});

export const expressLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info({ req }, 'request');
  res.on('finish', () => logger.info({ res }, 'response'));
  next();
};

export default logger;
