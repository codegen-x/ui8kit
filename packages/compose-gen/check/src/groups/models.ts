// The content models (specs/models/<id>.json): every model matches model.schema.json and its own key, every block that names a model
// (BlockSpec.model) names one that exists, and its organism takes exactly the fields of the model as props (plus axes and settings).
// The simple line is the line of the model blocks: a block of line "simple" has a model, a block with a model is of a line.
import { loadModels, propsProblems } from "../../../model/src/index";
import { validate } from "../../../schema/src/index";
import { result, type Ctx, type CheckResult } from "./context";

export function checkModels(ctx: Ctx): CheckResult {
  const problems: string[] = [];
  const models = loadModels(ctx.root);
  for (const [key, { file, model }] of models) {
    for (const e of validate("model", model)) problems.push(`${file}: ${e}`);
    if (!file.endsWith(`/${model.id}.json`)) problems.push(`${file}: the file name is not the id ${model.id}`);
    if (models.size !== new Set([...models.values()].map((m) => m.model.id)).size) problems.push(`${key}: two files with the same id`);
  }
  const orgs = new Map(ctx.inputs.organisms.map((o) => [o.value.name, o.value]));
  const used = new Set<string>();
  for (const { value: b } of ctx.inputs.blocks) {
    if (b.line && !b.model) problems.push(`${b.id}: line ${b.line} without a model`);
    if (!b.model) continue;
    if (!b.line) problems.push(`${b.id}: model ${b.model} without a line`);
    const m = models.get(b.model);
    if (!m) { problems.push(`${b.id}: model ${b.model} is not in specs/models`); continue; }
    used.add(b.model);
    const org = orgs.get(b.organism);
    if (!org) { problems.push(`${b.id}: no organism ${b.organism}`); continue; }
    problems.push(...propsProblems(b, org, m.model));
  }
  for (const key of models.keys()) if (!used.has(key)) problems.push(`specs/models: ${key} is the model of no block`);
  return result("models", `${models.size} content models match their schema, and every model block takes exactly its model fields as props`, problems);
}
