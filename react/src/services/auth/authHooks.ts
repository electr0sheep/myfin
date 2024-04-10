import { queryClient } from '../../data/react-query.ts';
import AuthServices from './authServices.ts';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useUserData } from '../../providers/UserProvider.tsx';

const QUERY_KEY_SESSION_VALIDITY = 'session_validity';

export function useLogout() {
  const { clearSessionData } = useUserData();

  function logout() {
    clearSessionData();
    queryClient
      .invalidateQueries({ queryKey: [QUERY_KEY_SESSION_VALIDITY] })
      .then();
  }

  return logout;
}

export function useLogin() {
  const { updateUserSessionData, updateUserAccounts } = useUserData();

  async function login(data: { username: string; password: string }) {
    const resp = await AuthServices.attemptLogin(data);
    const { accounts, ...sessionData } = resp.data;
    updateUserSessionData(sessionData);
    updateUserAccounts(accounts);
    return resp;
  }

  return useMutation({
    mutationFn: login,
  });
}

export function useAuthStatus(checkServer: boolean = true) {
  const { userSessionData } = useUserData();

  async function checkIsAuthenticated() {
    const hasLocalSessionData = userSessionData != null;
    if (!hasLocalSessionData || !checkServer) return hasLocalSessionData;
    return AuthServices.validateSession();
  }

  const query = useQuery({
    queryKey: [QUERY_KEY_SESSION_VALIDITY],
    queryFn: checkIsAuthenticated,
  });

  return { isAuthenticated: query.isSuccess && query.data, ...query };
}
