import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { useLoginWithGithub } from '@git-notes/common';
import logoSvg from '../../../assets/logo.svg';

import './header.scss';

export function Header() {
  const isLoggedIn = false;
  const userImg = '';
  const userName = 'Haris';
  const { loginWithGithub } = useLoginWithGithub();

  const handleGithubLogin = async () => {
    try {
      const result = await loginWithGithub();
      if (result) {
        console.log('Login successful:', result.user);
      }
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
              <img src={userImg} alt="Profile" />
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
              <div className="cursor-pointer">Sign out</div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
}
