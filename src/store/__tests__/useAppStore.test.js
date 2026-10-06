import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "../useAppStore";

const storageKey = "pawjournal-app";

describe("app store privacy", () => {
  beforeEach(() => {
    useAppStore.persist.clearStorage();
    useAppStore.setState({
      session: null,
      activeDog: null,
      activeDogId: null,
      themeMode: "system",
    });
  });

  it("persists the theme without dog details", () => {
    useAppStore.getState().setThemeMode("dark");
    useAppStore.getState().setActiveDog({
      id: "dog-1",
      name: "Vader",
      notes: "Private notes",
      photoUrl: "https://example.com/temporary-photo-link",
    });

    const persisted = JSON.parse(localStorage.getItem(storageKey));
    expect(persisted.state).toEqual({ themeMode: "dark" });
  });

  it("removes dog details from legacy persisted state", async () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        state: {
          themeMode: "dark",
          activeDog: { id: "dog-1", name: "Vader", notes: "Private notes" },
          activeDogId: "dog-1",
        },
        version: 0,
      }),
    );

    await useAppStore.persist.rehydrate();

    expect(useAppStore.getState().activeDog).toBeNull();
    expect(useAppStore.getState().activeDogId).toBeNull();
    expect(JSON.parse(localStorage.getItem(storageKey)).state).toEqual({
      themeMode: "dark",
    });
  });

  it("clears the selected dog on logout and account changes", () => {
    const { setActiveDog, setSession } = useAppStore.getState();
    setSession({ user: { id: "user-1" } });
    setActiveDog({ id: "dog-1", name: "Vader" });

    setSession({ user: { id: "user-2" } });
    expect(useAppStore.getState().activeDog).toBeNull();
    expect(useAppStore.getState().activeDogId).toBeNull();

    setActiveDog({ id: "dog-2", name: "Milo" });
    setSession(null);
    expect(useAppStore.getState().activeDog).toBeNull();
    expect(useAppStore.getState().activeDogId).toBeNull();
  });
});
