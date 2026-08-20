// A structured record of changes to *generated document content* -- new
// sections, new documents, changed structure -- as opposed to CHANGELOG.md,
// which covers the whole project (new commands, fixes, etc.).
//
// `upgrade` reads this to tell a project what changed in the templates since
// it was generated. Add an entry here whenever a change to templates/ would
// be worth an existing project knowing about. New CLI commands, internal
// refactors, and anything that doesn't change generated document content do
// NOT belong here -- only things a project owner would want applied to their
// own docs.

export const TEMPLATE_CHANGES = [
  {
    version: "0.3.1",
    date: "2026-08-19",
    changes: [
      {
        file: "docs/05-architecture/SYSTEM_ARCHITECTURE.md",
        description:
          'Added a "Technology choices" section (language, frameworks, ' +
          "database, hosting, key libraries) -- nothing previously captured " +
          "this anywhere in the blueprint."
      }
    ]
  }
];
