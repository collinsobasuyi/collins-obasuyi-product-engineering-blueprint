# blueprint-template-test — Test Strategy

## Objective

Provide confidence that blueprint-template-test behaves correctly, securely and accessibly.

## Test levels

### Unit

Test isolated business and domain logic.

### Integration

Test interactions between components and external dependencies.

### API

Validate contracts, error handling, authentication and authorisation.

### End-to-end

Test critical user journeys through the deployed application.

### Accessibility

Test keyboard, semantic structure, screen reader behaviour and relevant WCAG requirements.

### Security

Validate the documented security baseline and known threat scenarios.

### Performance

Measure important user journeys against defined performance budgets.

## Regression strategy

Bug fixes should include regression coverage where practical.

## Environments

TODO

## Release criteria

A release should not proceed with unresolved critical failures.
