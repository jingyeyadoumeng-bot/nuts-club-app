# Ticket validation

Database constraints currently accept `available` and `used` statuses. The frontend filters `active` and the ticket issue RPC writes `active`, so the ticket workflow needs a coordinated fix before launch.

No staff users are configured. Do not grant roles without verifying ownership.
