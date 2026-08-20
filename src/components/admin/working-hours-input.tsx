"use client";

import { DAY_KEYS, DayKey, WorkingHours } from "@/lib/working-hours";

const DAY_LABELS: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export function WorkingHoursInput({
  value,
  onChange,
}: {
  value: Partial<WorkingHours>;
  onChange: (next: Partial<WorkingHours>) => void;
}) {
  function toggleDay(day: DayKey, enabled: boolean) {
    const next = { ...value };
    if (enabled) {
      next[day] = { start: "09:00", end: "17:00" };
    } else {
      delete next[day];
    }
    onChange(next);
  }

  function setTime(day: DayKey, field: "start" | "end", time: string) {
    const current = value[day] ?? { start: "09:00", end: "17:00" };
    onChange({ ...value, [day]: { ...current, [field]: time } });
  }

  return (
    <div className="space-y-2">
      {DAY_KEYS.map((day) => {
        const enabled = !!value[day];
        return (
          <div key={day} className="flex items-center gap-3 text-sm">
            <label className="flex w-20 items-center gap-2">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => toggleDay(day, e.target.checked)}
              />
              {DAY_LABELS[day]}
            </label>
            {enabled && (
              <>
                <input
                  type="time"
                  value={value[day]?.start}
                  onChange={(e) => setTime(day, "start", e.target.value)}
                  className="rounded border px-2 py-1"
                />
                <span>to</span>
                <input
                  type="time"
                  value={value[day]?.end}
                  onChange={(e) => setTime(day, "end", e.target.value)}
                  className="rounded border px-2 py-1"
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
