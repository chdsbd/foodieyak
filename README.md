# foodieyak

> Keep track of good and bad food

[site](https://foodieyak.com) | [staging site](https://staging.foodieyak.com)

## Prior Art / Alternatives

| name                        | created                                               |
| --------------------------- | ----------------------------------------------------- |
| [Beli](https://beliapp.com) | [2019-07-26](https://www.whois.com/whois/trybeli.com) |

## dev

### ui

dev

```sh
cd ui

yarn

yarn dev
# NOTE: make sure to open on localhost:$PORT rather than 127.0.0.1:$PORT to make
# google maps work locally

```

Deployment is automatic.

### updating firestore rules

Use the Firebase console and copy paste the result into the repo once it's
working.

### updating functions

Deploying changes to these is currently manual and requires using the firebase
cli.
