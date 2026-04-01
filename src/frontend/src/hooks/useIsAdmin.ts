import { useInternetIdentity } from "./useInternetIdentity";

// Admin principals hardcoded in frontend — no backend call needed.
// To add more admins, add their principal string to this array.
const ADMIN_PRINCIPALS = [
  "x3m76-4lxyy-c7idq-woytx-gna5i-5lgxx-log7y-nimmx-d7m6w-slhnq-gqe",
  "qwq4l-mjwka-op3ra-a5i2z-pnhar-7zyoo-jovrh-czfm5-vjrb3-wp22j-tqe",
];

export function useIsAdmin() {
  const { identity } = useInternetIdentity();
  if (!identity) return false;
  const principal = identity.getPrincipal().toString();
  return ADMIN_PRINCIPALS.includes(principal);
}
