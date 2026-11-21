# compose-gen/model

Content models (`specs/models/<id>.json`, schema `schema/schemas/model.schema.json`): one JSON object of content per block of
the simple line, valid in every variant (`BlockSpec.model = "<id>@<version>"`, `BlockSpec.line = "simple"`).

- `schemaOf(model)`: the JSON Schema 2020-12, closed at every level, `$id` `https://registry.buildy.tw/models/<id>@<v>.schema.json`
- `typesOf(model)`: the TypeScript types (one per list record, then `<Id>Content`)
- `validate(model, value)` (`src/validate.ts`, no imports, copied as is by packages/prototypes): issues as JSON pointers;
  agrees with the schema (test/model.test.ts)
- `propsProblems(block, organism, model)`: the organism takes exactly the model fields as props (same required-ness and
  type), plus the axes of the block, the settings (`id`, `level`, `padding`, `align`, `landmarkLabel`) and the `DERIVED` props an export writes
  from `image` (`imageSrcset`, on sections and records, only next to `image`); compose-gen check group `models`

Field types: `id`, `text`, `longText`, `url` (http, https, mailto, tel or a path), `image` (http, https or a path; never
`data:` or `javascript:`), `list` (of a record, `minItems`/`maxItems`).
