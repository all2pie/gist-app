import logoSvg from '@/assets/logo.svg';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { useAuthStore, useSearchStore } from '@/store';
import { useLoginWithGithub } from '@git-notes/common';
import './header.scss';
import { Link, NavLink } from 'react-router-dom';

export function Header() {
  const { login, logout, user, isLoggedIn } = useAuthStore();
  const { searchQuery, setSearchQuery } = useSearchStore();
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
      <Link className="logo" to="/">
        <img src={logoSvg} alt="Logo" />
      </Link>
      <div className="actions">
        <div className="search-container">
          <Input
            placeholder="Search gists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

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
              <NavLink className="cursor-pointer" to="/create">
                Create gist
              </NavLink>
              <NavLink className="cursor-pointer" to="/starred">
                Starred gists
              </NavLink>
              <NavLink className="cursor-pointer" to="/profile">
                Profile
              </NavLink>
              <hr />
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
