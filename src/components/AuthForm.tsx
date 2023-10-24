'use client';

import { FC, useState } from 'react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import { signIn } from 'next-auth/react';
import { Icons } from './Icons';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const AuthForm: FC<AuthFormProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      const res = await signIn('google', {
        callbackUrl: '/',
      });
    } catch (error) {
      toast({
        title: 'There was a problem',
        description:
          'There was an error logging in with Google',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex justify-center', className)}>
      <Button
        onClick={loginWithGoogle}
        size='sm'
        className='w-full'
        isLoading={isLoading}
      >
        {isLoading ? null : (
          <Icons.google className='h-4 w-4 mr-2' />
        )}
        Google
      </Button>
    </div>
  );
};

export default AuthForm;
