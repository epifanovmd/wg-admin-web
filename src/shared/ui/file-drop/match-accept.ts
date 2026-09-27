/** Проверяет файл по правилам атрибута `accept`: `.ext`, `type/*`, `type/subtype`. */
export const matchesAccept = (file: File, accept?: string): boolean => {
  const rules = (accept ?? "")
    .split(",")
    .map(rule => rule.trim().toLowerCase())
    .filter(Boolean);

  if (rules.length === 0) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return rules.some(rule => {
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));

    return type === rule;
  });
};
