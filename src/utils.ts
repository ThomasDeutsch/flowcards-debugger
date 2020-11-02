export function sortById<T>(flowById: Record<string, T>) {
  if (!flowById) return [];
  const result = Object.keys(flowById).sort(function(a, b) {
    var idA = a.toUpperCase();
    var idB = b.toUpperCase();
    if (idA < idB) {
      return -1;
    }
    if (idA > idB) {
      return 1;
    }
    return 0;
  });
  return result.map(id => flowById[id]);
}
