cd ../frontend && npm install
cd ../backend && npm install

RUN npm i @angular/cli -g --verbose
RUN source <(ng completion script)
