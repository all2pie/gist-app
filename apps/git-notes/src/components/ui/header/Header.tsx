import logoSvg from '@/assets/logo.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuthStore } from '@/store';
import { useLoginWithGithub } from '@git-notes/common';
import './header.scss';

export function Header() {
  const { login, logout, user, isLoggedIn } = useAuthStore();
  const { loginWithGithub } = useLoginWithGithub();
  const userImg = user?.photoURL || '';
  const userName = user?.displayName || 'anonymous';

  const handleGithubLogin = async () => {
    try {
      const { token, user } = await loginWithGithub();
      login(token, user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <header>
      <div className="logo">
        <img src={logoSvg} alt="Logo" />
      </div>
      <div className="actions">
        <Input placeholder="Search gists..." />

        {!isLoggedIn && (
          <Button variant="outline" onClick={handleGithubLogin}>
            Login
          </Button>
        )}

        {isLoggedIn && (
          <Popover>
            <PopoverTrigger asChild>
              <img src={userImg} alt="Profile" height={40} width={40} />
            </PopoverTrigger>
            <PopoverContent align="end" className="menu">
              <div style={{ color: '#3D3D3D' }}>Signed in as</div>
              <div className="font-bold">{userName}</div>
              <hr />
              <div className="cursor-pointer">Your gists</div>
              <div className="cursor-pointer">Starred gists</div>
              <div className="cursor-pointer">Your GitHub profile</div>
              <hr />
              <div className="cursor-pointer">Help</div>
              <div className="cursor-pointer" onClick={logout}>
                Sign out
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
}
