# Contributing

Thanks for considering a contribution to the Collins Obasuyi Product Engineering Blueprint. This is a v0.1 project, so the process is intentionally lightweight.

## Getting started

1. Fork the repository.
2. Create a branch for your change (`git checkout -b my-change`).
3. Make your change.
4. Run the test suite:

   ```bash
   npm test
   ```

5. Confirm the npm package still builds correctly:

   ```bash
   npm pack --dry-run
   ```

6. Open a pull request describing what changed and why.

## Ground rules

- **No unresolved template placeholders.** If you add or edit a template under `templates/` or `checklists/`, make sure every `{{PLACEHOLDER}}` you introduce is one the generator actually replaces (see `scripts/generate-project.js`), and that a generated project never ends up with a literal `{{...}}` left in it. `npm test` covers this, but check by hand for anything new.
- **Templates should stay generic.** These are starting points for any project, not a place to encode assumptions specific to one product, stack, or company. If content only makes sense for a narrow case, it probably belongs in `examples/`, not `templates/`.
- **Explain methodology changes.** If you're proposing a change to *what* the blueprint asks for or *how* it structures a project (a new document category, a new conditional module, a changed checklist), explain the reasoning in the PR description — not just what changed, but why the current structure doesn't cover it.
- **Keep `bin/cli.js` thin.** Generation logic belongs in `scripts/generate-project.js`, which is what the tests exercise directly. The CLI should stay limited to prompts, argument parsing, and output.

## Reporting issues

Open a GitHub issue. Include what you expected, what happened instead, and (if relevant) the answers you gave to the `init` prompts — that's usually enough to reproduce a generation issue.
