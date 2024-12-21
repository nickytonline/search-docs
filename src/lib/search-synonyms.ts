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
  'mfa': ['multi-factor authentication', 'multi factor authentication'],
  '2fa': ['two-factor authentication', 'two factor authentication'],

  // Identity Provider related
  'idp': ['identity provider'],
  'oidc': ['openid connect'],
  'saml': ['security assertion markup language'],

  // Single Sign-On related
  'sso': ['single sign-on', 'single sign on'],

  // Zero Trust related
  'zt': ['zero trust'],
  'ztna': ['zero trust network access'],
  'sase': ['secure access service edge'],
  'zta': ['zero trust architecture'],
  'ztaa': ['zero trust application access'],

  // Service Mesh related
  'servicemesh': ['service mesh'],

  // Network Access related
  'vpn': ['virtual private network'],
  'sdn': ['software defined networking'],
  'sdp': ['software defined perimeter'],
  'nac': ['network access control'],
  'pac': ['proxy auto config', 'proxy auto-config'],

  // Security related
  'rbac': ['role based access control', 'role-based access control'],
  'iam': ['identity and access management'],
  'pam': ['privileged access management'],
  'mtls': ['mutual tls', 'mutual transport layer security'],
  'tls': ['transport layer security'],
  'ssl': ['secure sockets layer'],
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