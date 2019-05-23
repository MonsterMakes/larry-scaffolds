# {{projectName}}

[![https://nodei.co/npm/{{projectName}}.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/{{projectName}}.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/{{projectName}})


## Description
***Update This*** Add the intent of your package here...

## Developer Setup

This project is leveraging the `{{authProjectName}}` library to provide authentication and authorization. Make sure to first copy `src/environment-details.json.template` to `src/environment-details.json` and provide proper values. Obviously this also requires the companion auth services running.

### Developing {{authProjectName}}???
If you are working on the auth module you are going to need to first delete `node_modules/{{authProjectName}}` and then make sure the raw source version of `{{authProjectName}}` is in the same parent directory as this project and is named `{{authGithubProjectName}}`. Finally make sure you run `build-watch` in the `{{authGithubProjectName}}` project prior to running `npm start` in this project.

## TODO
1. **Update This**