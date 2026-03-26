import { promises as fs } from "node:fs";
import path from "node:path";
import { defaultEvents, sortEventsByDate, sortEventsForDisplay, type EventDraft, type EventItem } from "@/lib/events";

const dataFilePath = path.join(process.cwd(), "data", "events.json");

const ensureDataFile = async () => {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(
      dataFilePath,
      JSON.stringify(sortEventsByDate(defaultEvents), null, 2),
      "utf8",
    );
  }
};

const readRawEvents = async () => {
  await ensureDataFile();

  try {
    const fileContents = await fs.readFile(dataFilePath, "utf8");
    const parsed = JSON.parse(fileContents) as EventItem[];
    return sortEventsByDate(parsed);
  } catch {
    return sortEventsByDate(defaultEvents);
  }
};

const writeRawEvents = async (events: EventItem[]) => {
  await fs.writeFile(
    dataFilePath,
    JSON.stringify(sortEventsByDate(events), null, 2),
    "utf8",
  );
};

export const listEvents = async () => {
  const events = await readRawEvents();
  return sortEventsForDisplay(events);
};

export const getEventById = async (id: string) => {
  const events = await readRawEvents();
  return events.find((event) => event.id === id) ?? null;
};

export const listPreviousEventsInSeries = async (
  seriesId: string,
  currentEventId: string,
  currentEventStartDate: string,
) => {
  const events = await readRawEvents();
  const currentTime = new Date(currentEventStartDate).getTime();

  return events
    .filter((event) => {
      return (
        event.seriesId === seriesId &&
        event.id !== currentEventId &&
        new Date(event.startDate).getTime() < currentTime
      );
    })
    .sort((first, second) => {
      return (
        new Date(second.startDate).getTime() - new Date(first.startDate).getTime()
      );
    });
};

export const createEvent = async (draft: EventDraft) => {
  const events = await readRawEvents();
  const nextEvent: EventItem = {
    ...draft,
    id: crypto.randomUUID(),
  };
  const nextEvents = [...events, nextEvent];
  await writeRawEvents(nextEvents);
  return nextEvent;
};

export const updateEvent = async (id: string, draft: EventDraft) => {
  const events = await readRawEvents();
  let updatedEvent: EventItem | null = null;

  const nextEvents = events.map((event) => {
    if (event.id !== id) {
      return event;
    }

    updatedEvent = {
      ...draft,
      id,
    };

    return updatedEvent;
  });

  if (!updatedEvent) {
    return null;
  }

  await writeRawEvents(nextEvents);
  return updatedEvent;
};

export const deleteEvent = async (id: string) => {
  const events = await readRawEvents();
  const nextEvents = events.filter((event) => event.id !== id);
  await writeRawEvents(nextEvents);
};
