# Foodieyak API

Written with Starlette and EdgeDB.

## Starlette Issues

- Authentication backends don't have acess to application state, so we can't get access to our edgedb connection pool. Need to write our own middleware.
- Authentication errors return 403 when no auth instead of 401?
