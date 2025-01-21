import App from './app.js';

const app = new App(Number(process.env.PORT) || 8080);
console.log(`Starting node app with port: ${port}`);

['SIGTERM', 'SIGINT', 'SIGQUIT'].forEach(signal => {
  process.on(signal, async () => {
    await app.stop();
    process.exit(0);
  });
});

app.start();

export default app;
