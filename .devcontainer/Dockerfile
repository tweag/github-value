ARG VARIANT=23-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

# [Optional] Uncomment if you want to install more global node modules
ARG NODE_MODULES="@angular/cli"
RUN npm install -g @angular/cli
