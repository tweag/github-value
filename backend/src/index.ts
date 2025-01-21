import App from './app.js';

const DEFAULT_PORT = 80;
const app = new App(Number(process.env.PORT) || DEFAULT_PORT);

['SIGTERM', 'SIGINT', 'SIGQUIT'].forEach(signal => {
  process.on(signal, async () => {
    await app.stop();
    process.exit(0);
  });
});

app.start();

export default app;
