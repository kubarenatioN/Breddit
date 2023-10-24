'use client';

import { User } from 'next-auth';
import { FC } from 'react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import UserAvatar from './UserAvatar';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface UserProfileAreaProps {
  user: Pick<User, 'name' | 'image' | 'email'>;
}

const UserProfileArea: FC<UserProfileAreaProps> = ({
  user,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          className='h-8 w-8'
          user={{
            name: user.name ?? null,
            image: user.image ?? null,
          }}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className='bg-white' align='end'>
        <div className='flex items-center justify-start gap-2 p-2'>
          <div className='flex flex-col space-y-1 leading-none'>
            {user.name && (
              <p className='font-medium'>{user.name}</p>
            )}
            {user.email && (
              <p className='w-[200px] truncate text-sm text-zinc-700'>
                {user.email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href='/'>Feed</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href='/r/create'>Create community</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href='/settings'>Settings</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            signOut({
              callbackUrl: `/sign-in`,
            });
          }}
          className='cursor-pointer'
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileArea;
