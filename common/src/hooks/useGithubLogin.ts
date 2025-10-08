import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  User,
} from 'firebase/auth';

export const useLoginWithGithub = () => {
  const loginWithGithub = async (): Promise<{
    user: User;
    token: string;
  }> => {
    const provider = new GithubAuthProvider();
    provider.addScope('gist');
    const auth = getAuth();

    const result = await signInWithPopup(auth, provider);
    const credential = GithubAuthProvider.credentialFromResult(result);

    if (!credential) {
      throw new Error('No credential received from GitHub');
    }

    const token = credential.accessToken;
    if (!token) {
      throw new Error('No access token received from GitHub');
    }

    const user = result.user;

    return { user, token };
  };

  return { loginWithGithub };
};
