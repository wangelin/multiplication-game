import { writable } from "svelte/store";

export function createBrowserStore(browserStore = sessionStorage) {
  return function (key, initialValue) {
    const store = writable(initialValue);
    const { subscribe, set } = store;
    const value = browserStore.getItem(key);

    if (value) {
      try {
        const jsValue = JSON.parse(value);
        set(jsValue);
      } catch {
        set(undefined);
      }
    }

    return {
      set(value) {
        browserStore.setItem(key, JSON.stringify(value));
        set(value);
      },
      update(cb) {
        const value = cb(get(store));
        this.set(value);
      },
      subscribe,
    };
  };
}

export const localStore = createBrowserStore(localStorage);
export const sessionStore = createBrowserStore();

export const score_store = sessionStore("score", 0);
export const mistake_store = sessionStore("misstake", 0);
export const stars_store = sessionStore("stars", 0);
export const streak_store = sessionStore("streak", 0);
export const game_type_store = sessionStore("game_type", 1);
export const selected_levels_store = sessionStore("selected_levels", []);
