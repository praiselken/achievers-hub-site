const KEY = 'ah_demo_mode';

export function isDemoMode(): boolean {
  return typeof window !== 'undefined' && sessionStorage.getItem(KEY) === '1';
}

export function enterDemoMode() {
  sessionStorage.setItem(KEY, '1');
}

export function exitDemoMode() {
  sessionStorage.removeItem(KEY);
}
