# update-multiple-deps-action

> A GitHub Action to update multiple dependencies in a single PR

## Inputs

| Name   | Description                                                               | Required | Default |
| ------ | ------------------------------------------------------------------------- | -------- | ------- |
| latest | A comma separated list of dependencies to update to the `@latest` version | false    | NA      |
| next   | A comma separated list of dependencies to update to the `@next` version   | false    | NA      |

> Note: At least one of `latest` or `next` must be provided as an input

## Usage

```yaml
name: Update Dependencies

on:
  schedule:
    - cron: "0 0 13 * *"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - uses: zidious/update-multiple-deps-action@v1
        with:
            latest: 'typescript,@types/node'
            next: 'react'
      - name: Create Pull Request with changes from update-multiple-deps-action
         uses: peter-evans/create-pull-request@v3
        with:
          token: ${{ secrets.PAT }}
          commit-message: 'chore: update dependencies'
          branch: robot-update-dependencies
          base: main
          title: 'chore: update depdencies'
          body: 'This PR updates dependencies'
```
