'use client';

import { useOnClickOutside } from '@/hooks/use-on-click-outside';
import { Prisma, Subreddit } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';

interface SearchBarProps {}

const SearchBar: FC<SearchBarProps> = ({}) => {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const commandRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(commandRef, () => {
    setSearch('');
  });

  const pathname = usePathname();

  useEffect(() => {
    setSearch('');
  }, [pathname]);

  const {
    data: queryRes,
    refetch,
    isFetched,
  } = useQuery({
    queryFn: async () => {
      if (!search) {
        return [];
      }

      const { data } = await axios.get(
        `/api/search?q=${search}`
      );

      return data as Array<
        Subreddit & {
          _count: Prisma.SubredditCountOutputType;
        }
      >;
    },
    queryKey: ['search-query'],
    enabled: false,
  });

  const request = debounce(() => refetch(), 300);

  const debounceRequest = useCallback(() => {
    request();
  }, []);

  return (
    <Command
      ref={commandRef}
      className='relative rounded-lg border max-w-lg z-50 overflow-visible'
    >
      <CommandInput
        value={search}
        onValueChange={(text) => {
          setSearch(text);
          debounceRequest();
        }}
        className='outline-none border-none focus:border-none focus:outline-none ring-0'
        placeholder='Search communities...'
      ></CommandInput>

      {search.length > 0 ? (
        <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-b-md'>
          {isFetched && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {(queryRes?.length ?? 0) > 0 ? (
            <CommandGroup>
              {queryRes?.map((subreddit) => {
                return (
                  <CommandItem
                    key={subreddit.id}
                    onSelect={(e) => {
                      router.push(`/r/${e}`);
                      router.refresh();
                    }}
                    value={subreddit.name}
                  >
                    <Users className='mr-2 h-4 w-4' />
                    <a href={`/r/${subreddit.name}`}>
                      r/${subreddit.name}
                    </a>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null}
        </CommandList>
      ) : null}
    </Command>
  );
};

export default SearchBar;
