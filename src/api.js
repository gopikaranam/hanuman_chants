const BASE = "https://localhost:7137/api/session";

// CREATE
export const createSession = async () => {
  const res = await fetch(BASE, { method: "POST" });
  return res.json();
};

// GET
export const getSession = async (id) => {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Invalid ID");
  return res.json();
};

// UPDATE RANGE
export const updateRange = async (id, start, end) => {
  await fetch(`${BASE}/range`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, rangeStart: start, rangeEnd: end })
  });
};

// ADD COMPLETED DATE
export const addCompletedDate = async (id, dateKey) => {
  await fetch(`${BASE}/complete`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, date: dateKey })
  });
};
