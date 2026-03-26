"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import type { EventDraft, EventItem } from "@/lib/events";
import { formatEventDateRange, sortEventsForDisplay } from "@/lib/events";

const createEmptyDraft = (): EventDraft => ({
  seriesId: "",
  title: "",
  summary: "",
  description: "",
  location: "",
  host: "",
  startDate: "",
  endDate: "",
  capacity: 80,
  accent: "#5f8f72",
  coverImage: "/events/sunset-cover.svg",
  galleryImages: [
    "/events/sunset-gallery-1.svg",
    "/events/sunset-gallery-2.svg",
    "/events/sunset-gallery-3.svg",
  ],
});

const toInputDateTime = (value: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const fromInputDateTime = (value: string) => {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString();
};

type AdminEventsPanelProps = {
  adminLabel: string;
  initialEvents: EventItem[];
};

const createDraftFromEvent = (event: EventItem): EventDraft => {
  return {
    seriesId: event.seriesId,
    title: event.title,
    summary: event.summary,
    description: event.description,
    location: event.location,
    host: event.host,
    startDate: event.startDate,
    endDate: event.endDate,
    capacity: event.capacity,
    accent: event.accent,
    coverImage: event.coverImage,
    galleryImages: event.galleryImages,
  };
};

export default function AdminEventsPanel({
  adminLabel,
  initialEvents,
}: AdminEventsPanelProps) {
  const [events, setEvents] = useState(initialEvents);
  const [draft, setDraft] = useState<EventDraft>(() => createEmptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const seriesSuggestions = useMemo(() => {
    return Array.from(
      new Set(
        events
          .map((event) => event.seriesId.trim())
          .filter(Boolean),
      ),
    ).sort((first, second) => first.localeCompare(second));
  }, [events]);

  const handleDelete = (id: string) => {
    void (async () => {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        window.location.href = "/admin/login?expired=1";
        return;
      }

      if (!response.ok) {
        return;
      }

      setEvents((current) => current.filter((event) => event.id !== id));
    })();
  };

  const isValid = useMemo(() => {
    return Boolean(
      draft.title &&
        draft.summary &&
        draft.description &&
        draft.location &&
        draft.host &&
        draft.startDate &&
        draft.endDate,
    );
  }, [draft]);

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) {
      return [];
    }

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch("/api/uploads/events", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as {
      error?: string;
      files?: string[];
    };

    if (!response.ok || !payload.files) {
      if (response.status === 401) {
        window.location.href = "/admin/login?expired=1";
      }

      throw new Error(payload.error ?? "Unable to upload images.");
    }

    return payload.files;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void (async () => {
      if (!isValid) {
        return;
      }

      setIsSubmitting(true);

      const response = await fetch(
        editingId ? `/api/events/${editingId}` : "/api/events",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draft),
        },
      );

      const payload = (await response.json()) as { event?: EventItem };

      if (response.status === 401) {
        window.location.href = "/admin/login?expired=1";
        return;
      }

      if (!response.ok || !payload.event) {
        setIsSubmitting(false);
        return;
      }

      setEvents((current) => {
        const nextEvents = editingId
          ? current.map((item) => {
              return item.id === editingId ? payload.event! : item;
            })
          : [...current, payload.event!];

        return sortEventsForDisplay(nextEvents);
      });

      setDraft(createEmptyDraft());
      setEditingId(null);
      setIsSubmitting(false);
    })();
  };

  const startEditing = (event: EventItem) => {
    setEditingId(event.id);
    setDraft(createDraftFromEvent(event));
    setUploadError(null);
  };

  return (
    <section className="route-shell admin-shell">
      <section className="page-hero">
        <p className="eyebrow">Admin panel</p>
        <h1>Manage Woategi events with the built-in event backend.</h1>
        <p className="page-hero-copy">
          This panel writes through the app API today, and the repository split
          keeps a clean seam if you later move event storage to a separate backend.
        </p>
        <div className="page-hero-actions">
          <p className="admin-session-pill">Signed in as {adminLabel}</p>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="secondary-action">
              Log out
            </button>
          </form>
        </div>
      </section>

      <div className="admin-grid">
        <form className="admin-form-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <p className="eyebrow">Event editor</p>
            <h2>{editingId ? "Update event" : "Add event"}</h2>
          </div>

          <label className="admin-field">
            <span>Series ID</span>
            <input
              list="series-id-suggestions"
              value={draft.seriesId}
              onChange={(event) =>
                setDraft((current) => ({ ...current, seriesId: event.target.value }))
              }
            />
            <small className="admin-field-hint">
              Reuse an existing series ID to connect past and current editions.
            </small>
          </label>
          <datalist id="series-id-suggestions">
            {seriesSuggestions.map((seriesId) => (
              <option key={seriesId} value={seriesId} />
            ))}
          </datalist>

          <label className="admin-field">
            <span>Title</span>
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>

          <label className="admin-field">
            <span>Summary</span>
            <input
              value={draft.summary}
              onChange={(event) =>
                setDraft((current) => ({ ...current, summary: event.target.value }))
              }
            />
          </label>

          <label className="admin-field">
            <span>Description</span>
            <textarea
              rows={5}
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>

          <div className="admin-field-row">
            <label className="admin-field">
              <span>Location</span>
              <input
                value={draft.location}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
              />
            </label>

            <label className="admin-field">
              <span>Host</span>
              <input
                value={draft.host}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, host: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="admin-field-row">
            <label className="admin-field">
              <span>Start</span>
              <input
                type="datetime-local"
                value={toInputDateTime(draft.startDate)}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    startDate: fromInputDateTime(event.target.value),
                  }))
                }
              />
            </label>

            <label className="admin-field">
              <span>End</span>
              <input
                type="datetime-local"
                value={toInputDateTime(draft.endDate)}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    endDate: fromInputDateTime(event.target.value),
                  }))
                }
              />
            </label>
          </div>

          <div className="admin-field-row">
            <label className="admin-field">
              <span>Capacity</span>
              <input
                type="number"
                min={1}
                value={draft.capacity}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    capacity: Number(event.target.value) || 0,
                  }))
                }
              />
            </label>

            <label className="admin-field">
              <span>Accent</span>
              <input
                type="color"
                value={draft.accent}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    accent: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <label className="admin-field">
            <span>Cover image path</span>
            <input
              value={draft.coverImage}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  coverImage: event.target.value,
                }))
              }
            />
            <small className="admin-field-hint">
              Paste a public path or upload a new image from your device.
            </small>
          </label>

          <div className="admin-upload-panel">
            <div className="admin-upload-row">
              <div>
                <strong>Choose cover image</strong>
                <p>Uploads are saved inside this project and linked automatically.</p>
              </div>
              <label className="secondary-action admin-upload-button">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    void (async () => {
                      setUploadError(null);
                      setIsUploadingCover(true);

                      try {
                        const [uploadedFile] = await uploadImages(event.target.files);

                        if (uploadedFile) {
                          setDraft((current) => ({
                            ...current,
                            coverImage: uploadedFile,
                          }));
                        }
                      } catch (error) {
                        setUploadError(
                          error instanceof Error
                            ? error.message
                            : "Unable to upload the cover image.",
                        );
                      } finally {
                        setIsUploadingCover(false);
                        event.target.value = "";
                      }
                    })();
                  }}
                />
                {isUploadingCover ? "Uploading..." : "Choose image"}
              </label>
            </div>

            {draft.coverImage ? (
              <div className="admin-image-preview">
                <Image
                  src={draft.coverImage}
                  alt="Selected cover preview"
                  width={1200}
                  height={720}
                  className="admin-preview-image"
                  unoptimized
                />
                <small>{draft.coverImage}</small>
              </div>
            ) : null}
          </div>

          <label className="admin-field">
            <span>Gallery image paths</span>
            <textarea
              rows={4}
              value={draft.galleryImages.join("\n")}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  galleryImages: event.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                }))
              }
            />
            <small className="admin-field-hint">
              One path per line, or upload multiple gallery images below.
            </small>
          </label>

          <div className="admin-upload-panel">
            <div className="admin-upload-row">
              <div>
                <strong>Choose gallery images</strong>
                <p>Select multiple images to append them to this event gallery.</p>
              </div>
              <label className="secondary-action admin-upload-button">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    void (async () => {
                      setUploadError(null);
                      setIsUploadingGallery(true);

                      try {
                        const uploadedFiles = await uploadImages(event.target.files);

                        if (uploadedFiles.length) {
                          setDraft((current) => ({
                            ...current,
                            galleryImages: [
                              ...current.galleryImages,
                              ...uploadedFiles,
                            ],
                          }));
                        }
                      } catch (error) {
                        setUploadError(
                          error instanceof Error
                            ? error.message
                            : "Unable to upload the gallery images.",
                        );
                      } finally {
                        setIsUploadingGallery(false);
                        event.target.value = "";
                      }
                    })();
                  }}
                />
                {isUploadingGallery ? "Uploading..." : "Choose images"}
              </label>
            </div>

            {draft.galleryImages.length ? (
              <div className="admin-gallery-grid">
                {draft.galleryImages.map((imagePath, index) => (
                  <article key={`${imagePath}-${index}`} className="admin-gallery-item">
                    <Image
                      src={imagePath}
                      alt={`Gallery preview ${index + 1}`}
                      width={600}
                      height={600}
                      className="admin-preview-image"
                      unoptimized
                    />
                    <small>{imagePath}</small>
                    <button
                      type="button"
                      className="secondary-action admin-gallery-remove"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          galleryImages: current.galleryImages.filter(
                            (_item, itemIndex) => itemIndex !== index,
                          ),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            ) : null}
          </div>

          {uploadError ? <p className="admin-upload-error">{uploadError}</p> : null}

          <div className="admin-form-actions">
            <button
              type="submit"
              className="primary-action"
              disabled={!isValid || isSubmitting || isUploadingCover || isUploadingGallery}
            >
              {editingId ? "Save event" : "Create event"}
            </button>
            <button
              type="button"
              className="secondary-action event-action-button"
              onClick={() => {
                setDraft(createEmptyDraft());
                setEditingId(null);
                setUploadError(null);
              }}
            >
              Reset
            </button>
          </div>
        </form>

        <section className="admin-list-card">
          <div className="section-heading">
            <p className="eyebrow">Published events</p>
            <h2>{events.length} event entries</h2>
          </div>

          <div className="admin-events-list">
            {events.map((event) => (
              <article key={event.id} className="admin-event-row">
                <div>
                  <strong>{event.title}</strong>
                  <p>{formatEventDateRange(event.startDate, event.endDate)}</p>
                  <small>{event.location}</small>
                </div>

                <div className="admin-event-actions">
                  <button
                    type="button"
                    className="secondary-action event-action-button"
                    onClick={() => startEditing(event)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="secondary-action event-action-button"
                    onClick={() => handleDelete(event.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
