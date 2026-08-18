# {{PROJECT_NAME}} — Security Baseline

## Objective

Define the minimum security requirements that must hold throughout development.

## Authentication

- Use an approved authentication mechanism.
- Protect session tokens.
- Apply secure session expiry and revocation.
- Do not expose authentication secrets client-side.

## Authorisation

- Enforce access control server-side.
- Apply least privilege.
- Do not rely only on hidden UI controls.

## Input handling

- Treat external input as untrusted.
- Validate structured input.
- Escape or encode output where appropriate.

## Secrets

- Never commit secrets.
- Use environment variables or an approved secret store.

## Dependencies

- Keep dependencies current.
- Review critical vulnerabilities.
- Avoid unnecessary packages.

## Logging

- Do not log passwords, tokens or sensitive personal data.
- Ensure security-relevant events can be investigated.

## Release gate

Critical security findings must be resolved or explicitly risk-accepted before production release.
