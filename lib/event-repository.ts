import {
  EVENT_STORAGE_KEY,
  type EventDraft,
  type EventItem,
  defaultEvents,
  sortEventsByDate,
} from "@/lib/events";

export type EventRepository = {
  list: () => EventItem[];
  create: (draft: EventDraft) => EventItem;
  update: (id: string, draft: EventDraft) => EventItem | null;
  remove: (id: string) => void;
};

const parseEvents = (value: string | null) => {
  if (!value) {
    return sortEventsByDate(defaultEvents);
  }

  try {
    const parsed = JSON.parse(value) as EventItem[];
    return sortEventsByDate(parsed);
  } catch {
    return sortEventsByDate(defaultEvents);
  }
};

const persistEvents = (storage: Storage, events: EventItem[]) => {
  storage.setItem(EVENT_STORAGE_KEY, JSON.stringify(sortEventsByDate(events)));
};

// This repository is intentionally isolated so it can later be swapped with an API-backed adapter.
export const createLocalEventRepository = (storage: Storage): EventRepository => {
  return {
    list: () => {
      return parseEvents(storage.getItem(EVENT_STORAGE_KEY));
    },
    create: (draft) => {
      const nextEvent: EventItem = {
        ...draft,
        id: crypto.randomUUID(),
      };
      const events = parseEvents(storage.getItem(EVENT_STORAGE_KEY));
      persistEvents(storage, [...events, nextEvent]);
      return nextEvent;
    },
    update: (id, draft) => {
      const events = parseEvents(storage.getItem(EVENT_STORAGE_KEY));
      const nextEvents = events.map((event) => {
        if (event.id !== id) {
          return event;
        }

        return {
          ...draft,
          id,
        };
      });

      const updatedEvent = nextEvents.find((event) => event.id === id) ?? null;
      persistEvents(storage, nextEvents);
      return updatedEvent;
    },
    remove: (id) => {
      const events = parseEvents(storage.getItem(EVENT_STORAGE_KEY));
      persistEvents(
        storage,
        events.filter((event) => event.id !== id),
      );
    },
  };
};
