import { App } from "octokit";

if (!process.env.GITHUB_APP_ID) throw new Error('GITHUB_APP_ID is not set');
if (!process.env.GITHUB_APP_PRIVATE_KEY) throw new Error('GITHUB_APP_PRIVATE_KEY is not set');
// if (!process.env.GITHUB_APP_CLIENT_ID) throw new Error('GITHUB_CLIENT_ID is not set');
// if (!process.env.GITHUB_APP_CLIENT_SECRET) throw new Error('GITHUB_CLIENT_SECRET is not set');
if (!process.env.GITHUB_WEBHOOK_SECRET) throw new Error('GITHUB_WEBHOOK_SECRET is not set');
if (!process.env.GITHUB_APP_INSTALLATION_ID) throw new Error('GITHUB_APP_INSTALLATION_ID is not set');

const github = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
    webhooks: {
        secret: process.env.GITHUB_WEBHOOK_SECRET
    },
    installationId: process.env.GITHUB_APP_INSTALLATION_ID,
    oauth: {
        clientId: null!, // process.env.GITHUB_APP_CLIENT_ID,
        clientSecret: null! //process.env.GITHUB_APP_CLIENT_SECRET
    },
});

github.octokit.rest.apps.getAuthenticated().then(({ data }) => {
    console.log(`🤖 Authenticated to GitHub as ${data?.name}!`);
});

export default github;