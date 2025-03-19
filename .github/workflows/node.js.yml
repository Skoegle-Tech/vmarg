# This workflow will do a clean installation of node dependencies, cache/restore them, build the source code and run tests across different versions of node
# For more information see: https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs

name: Node.js CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:

    runs-on: self-hosted

    strategy:
      matrix:
        node-version: [18.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/

    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    - run: npm ci
    - run: npm run build --if-present
    - run: sudo rm -rf /var/www/vmarg.skoegle.com/dist
    - run: sudo mv ~/vmarg-prod/_work/vmarg/vmarg/dist /var/www/vmarg.skoegle.com
    - run: ls -lah /var/www/vmarg.skoegle.com
    - run: sudo chown -R www-data:www-data /var/www/vmarg.skoegle.com
    - run: sudo chmod -R 755 /var/www/vmarg.skoegle.com
    - run: sudo systemctl restart nginx
    - run: sudo systemctl reload nginx
    - run: sudo nginx -t
