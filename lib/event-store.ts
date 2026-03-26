"use client";

import { useSyncExternalStore } from "react";
import { createLocalEventRepository } from "@/lib/event-repository";
import { EVENT_STORAGE_KEY, defaultEvents, type EventDraft } from "@/lib/events";
import type { EventItem } from "@/lib/events";

const listeners = new Set<() => void>();
const serverSnapshot = defaultEvents;
let cachedStorageValue: string | null | undefined;
let cachedSnapshot: EventItem[] = serverSnapshot;

const notifyAll = () => {
  listeners.forEach((listener) => listener());
};

const getRepository = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return createLocalEventRepository(window.localStorage);
};

const getSnapshot = () => {
  if (typeof window === "undefined") {
    return serverSnapshot;
  }

  const storageValue = window.localStorage.getItem(EVENT_STORAGE_KEY);

  if (storageValue === cachedStorageValue) {
    return cachedSnapshot;
  }

  const repository = getRepository();
  cachedStorageValue = storageValue;
  cachedSnapshot = repository ? repository.list() : serverSnapshot;

  return cachedSnapshot;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === EVENT_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
};

export const useEventsStore = () => {
  const events = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);

  const repository = getRepository();

  return {
    events,
    createEvent: (draft: EventDraft) => {
      repository?.create(draft);
      notifyAll();
    },
    updateEvent: (id: string, draft: EventDraft) => {
      repository?.update(id, draft);
      notifyAll();
    },
    removeEvent: (id: string) => {
      repository?.remove(id);
      notifyAll();
    },
  };
};
