// utils/supabase/server.test.ts
import { createClient } from './server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Mock the dependencies
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('createClient', () => {
  const mockUrl = 'https://example.supabase.co';
  const mockKey = 'anon-key';
  const mockCookies = [
    { name: 'cookie1', value: 'value1' },
    { name: 'cookie2', value: 'value2' },
  ];

  let mockCookieStore: {
    getAll: jest.Mock;
    set: jest.Mock;
  };

  beforeEach(() => {
    // Set environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = mockUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = mockKey;

    // Mock cookie store
    mockCookieStore = {
      getAll: jest.fn().mockReturnValue(mockCookies),
      set: jest.fn(),
    };

    // Mock cookies() to return the mock cookie store
    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);

    // Mock createServerClient with implementation that checks for env vars
    (createServerClient as jest.Mock).mockImplementation((url, key, options) => {
      if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
      }
      return { supabase: 'client' };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it('should create a Supabase client with correct parameters', async () => {
    const client = await createClient();

    expect(cookies).toHaveBeenCalledTimes(1);
    expect(createServerClient).toHaveBeenCalledWith(
      mockUrl,
      mockKey,
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
    expect(client).toEqual({ supabase: 'client' });
  });

  it('should handle getAll cookies correctly', async () => {
    await createClient();
    const { getAll } = (createServerClient as jest.Mock).mock.calls[0][2].cookies;

    const result = getAll();
    expect(result).toEqual(mockCookies);
    expect(mockCookieStore.getAll).toHaveBeenCalledTimes(1);
  });

  it('should handle setAll cookies correctly', async () => {
    await createClient();
    const { setAll } = (createServerClient as jest.Mock).mock.calls[0][2].cookies;

    const cookiesToSet = [
      { name: 'newCookie', value: 'newValue', options: {} },
    ];

    setAll(cookiesToSet);

    expect(mockCookieStore.set).toHaveBeenCalledWith('newCookie', 'newValue', {});
    expect(mockCookieStore.set).toHaveBeenCalledTimes(1);
  });

  it('should not throw error in setAll when setting cookies fails', async () => {
    mockCookieStore.set.mockImplementation(() => {
      throw new Error('Set error');
    });

    await createClient();
    const { setAll } = (createServerClient as jest.Mock).mock.calls[0][2].cookies;

    const cookiesToSet = [
      { name: 'newCookie', value: 'newValue', options: {} },
    ];

    expect(() => setAll(cookiesToSet)).not.toThrow();
  });

  it('should throw error if environment variables are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    await expect(createClient()).rejects.toThrow('Missing Supabase environment variables');
  });
});