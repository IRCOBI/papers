# papers

[![CircleCI](https://circleci.com/gh/phdccltd/phdcc-papers.svg?style=shield)](https://circleci.com/gh/phdccltd/phdcc-papers)
[![Coverage Status](https://coveralls.io/repos/github/phdccltd/phdcc-papers/badge.svg?branch=main)](https://coveralls.io/github/phdccltd/phdcc-papers?branch=main)
<a href="https://sonarcloud.io/dashboard?id=phdccltd_phdcc-papers"><img src="https://sonarcloud.io/images/project_badges/sonarcloud-white.svg" height="20" alt="SonarCloud" ></a>

**Papers**: frontend for the IRCOBI abstract and paper submission and review system. Used before the conference by authors and reviewers.

To be used in conjunction with [papers-api](https://github.com/IRCOBI/papers-api).

## IRCOBI system overview

| Repo | Role | URL |
|------|------|-----|
| **papers** | **Papers submission frontend** | **conference.ircobi.org** |
| [papers-api](https://github.com/IRCOBI/papers-api) | Papers submission backend API | — |
| [conference](https://github.com/IRCOBI/conference) | Conference admin console + attendee API | confapp.ircobi.org |
| [conference-app](https://github.com/IRCOBI/conference-app) | Attendee mobile app (iOS/Android) | — |

## Cloud infrastructure

| Resource | ID / Name |
|----------|-----------|
| GCP project ID | `ircobi-papers-api` (display: "IRCOBI Papers & Conference") |
| Firebase site | `ircobi-papers-api` → https://ircobi-papers-api.web.app |
| Custom domain | https://conference.ircobi.org |

## Runtime environment

### Run papers server

#### server .env

Create a `.env` text file in the root directory of this component with the following secrets:

```
API='https://papers.example.org/api'
SITE='https://papers.example.org/'
RECAPTCHA_SITE_KEY='recaptcha site key'
```

Optionally add all these variables to send a mail when the production server is started:

```
STARTUP_EMAIL='to@example.com'
STARTUP_SUBJECT='Papers nuxt restarted'
STARTUP_FROM='from@example.com'
```

If running in a dev environment at localhost that calls a website server API, specify the server API `RECAPTCHA_BYPASS` to bypass the authenication recaptcha.
Do not put `RECAPTCHA_BYPASS` on your production site.

*Note: any values you put in this .env file WILL BE INCLUDED in the compiled code sent to the user.*

#### server shell command

Also create a shell file such as `runpapers.sh`:

```
./node_modules/.bin/cross-env PORT=1234 node .output/server/index.mjs
```

### Run as static website

Papers can be run as a static website without pm2 provided nginx, for example, is set up to server `200.html` if any page is not found,
eg include this in your config file in /etc/nginx/sites-available:

```
  root /var/www/.output/public;
  index index.html index.htm;
  location / {
		try_files $uri $uri/ =404;
	}
  error_page 404 /200.html;
```

In this case you simply need to run `npm run generate` instead of `npm run update` to restart the server.

## Build Setup

```
# Grab the code
git clone https://github.com/phdccltd/phdcc-papers.git
cd phdcc-papers

# install dependencies
npm install

# serve with hot reload at eg localhost:1234
npm run dev

# For simple production use:
npm run build
node .output/server/index.mjs

# For production in PM2, create an ecosystem file or start
npm run build
pm2 start runpapers.sh --name papers -- start
```

## Updating

An existing installation had best do a full install rather than an update:

```
git pull
rm package-lock.json
rm -r node_modules
npm install
npm run build
```

Then restart eg using pm2.

## Testing

This code has [Cypress End to End](https://www.cypress.io/) tests which generate coverage of the JavaScript/TypeScript in vue js and ts files.

The `clienttest` instance of this app must be run alongside the `forclient` instance of the Papers API code.
* Papers API `forclient`: runs using Sqlite3 in-memory database listening on a localhost port: `npm run forclient`
* Papers client `clienttest`: builds with coverage and runs at a local port access the API on its localhost port: `npm run clienttest`

You can then run Cypress interactively using `npx cypress open` or using command: `npm run cypress`.
Coverage output is generated in `\coverage`.

```
CYPRESS_COVERAGE='true'
NUXT_PORT=3000
NUXT_PUBLIC_SITE='https://example.com'
NUXT_PUBLIC_API='http://localhost:9000/api'
RECAPTCHA_SITE_KEY=''
```

## Used with thanks

Thanks to all the developers who produced the open-source modules that are used, including

* [Nuxt 3](https://nuxt.com), which is [Vue](https://vuejs.org/) 
* [bootstrap-vue-next](https://github.com/bootstrap-vue/bootstrap-vue-next), which is Bootstrap v5 for Vue/Nuxt. 

# Sponsors

This development has kindly been supported by 
[![IRCOBI](./docs/ircobi-picto.png)](http://ircobi.org/).

# License

[MIT](LICENCE)
