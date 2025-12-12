// Storage utilities to separate localStorage (persistent) from sessionStorage (per-tab)

export const storageUtils = {
  // Session storage - per tab/window (cleared when tab closes)
  session: {
    setToken: (token: string) => sessionStorage.setItem('token', token),
    getToken: () => sessionStorage.getItem('token'),
    setUser: (user: any) => sessionStorage.setItem('currentUser', JSON.stringify(user)),
    getUser: () => {
      const user = sessionStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    },
    setRole: (role: string) => sessionStorage.setItem('role', role),
    getRole: () => sessionStorage.getItem('role'),
    clear: () => sessionStorage.clear(),
  },

  // Local storage - persistent (shared across tabs - only use for non-auth data)
  local: {
    set: (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value)),
    get: (key: string) => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    },
    remove: (key: string) => localStorage.removeItem(key),
  },
};

