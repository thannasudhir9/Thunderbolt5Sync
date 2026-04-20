# GitHub Actions Deployment Workflow

To use this workflow, your GitHub Personal Access Token must have the `workflow` scope enabled. 

If you have the correct scope, create a file at `.github/workflows/deploy.yml` and paste the following content:

```yaml
name: Deploy to GitHub

on:
  push:
    branches: [ master, main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build Application
        run: npm run build
        
      - name: Verification
        run: npm run lint
```
