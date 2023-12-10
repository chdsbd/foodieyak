# Foodieyak API

Improve initial page load by:

- eliminating the need to wait for Firebase auth token refresh
- enable server side rendering

## Development

### Configure service account credentials

1. Generate a private key at https://console.firebase.google.com/u/0/project/foodieyak-staging/settings/serviceaccounts/adminsdk
2. Name the key `foodieyak-staging-firebase.json` and place in `foodieyak/api/`.
3. In `foodieyak/api/`, set the gcloud application credentials:

   ```bash
   # foodieyak/api/
   export GOOGLE_APPLICATION_CREDENTIALS=$PWD/foodieyak-staging-firebase.json
   ```

### Run project

```bash
# foodieyak/api/
s/dev
```
