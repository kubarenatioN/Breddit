import { buttonVariants } from '@/components/ui/Button';
import Link from 'next/link';
import { toast } from './use-toast';

export const useCustomToast = () => {
  const notLoginedToast = () => {
    const { dismiss } = toast({
      title: 'Login required.',
      description: 'Please, login to perform action.',
      variant: 'destructive',
      action: (
        <Link
          href='/sign-in'
          className={buttonVariants({ variant: 'outline' })}
          onClick={() => dismiss()}
        >
          Login
        </Link>
      ),
    });
  };

  return { notLoginedToast };
};
