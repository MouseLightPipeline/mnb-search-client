# Neuron Browser Search Client

The Search Client service is the user-facing front end to the denormalized neuron browser data.


### Authentication
By default the service requires basic authentication when `NODE_ENV` is set to `production`.  The authentication is
not designed for multi-user, public instances.  It is simply intended to prevent inadvertent use by internal users
prior to data being fully vetted and ready for internal consumption.

Username and password can be set using
* `SEARCH_AUTH_USER`
* `SEARCH_AUTH_PASS`

At minimum the placeholder password should be overridden when authentication is enabled.

Authentication is disabled when `NODE_ENV` is not `production` or if `SEARCH_AUTH_REQUIRED` is set to false.