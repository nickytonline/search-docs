export const searchSynonyms: Record<string, string[]> = {
  // Kubernetes related
  'k8s': ['kubernetes'],
  'kube': ['kubernetes'],

  // Observability related
  'o11y': ['observability'],

  // Infrastructure related
  'infra': ['infrastructure'],

  // Authentication related
  'auth': ['authentication', 'authorization'],
  'authn': ['authentication'],
  'authz': ['authorization'],

  // Identity Provider related
  'idp': ['identity provider'],

  // Single Sign-On related
  'sso': ['single sign-on'],

  // Zero Trust related
  'zt': ['zero trust'],

  // Service Mesh related
  'servicemesh': ['service mesh'],
};

export function expandSearchTerms(query: string): string[] {
  const terms = query.toLowerCase().split(/\s+/);
  const expanded = new Set<string>();

  terms.forEach(term => {
    // Add the original term
    expanded.add(term);

    // Add any synonyms only for abbreviated terms
    if (searchSynonyms[term]) {
      searchSynonyms[term].forEach(synonym => expanded.add(synonym));
    }
  });

  return Array.from(expanded);
}