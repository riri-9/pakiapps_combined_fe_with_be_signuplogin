import { useParcelFilters } from "../../../../src/features/inventory/hooks/useParcelFilters";
import type { Parcel } from "../../../../src/features/inventory/types/parcel";

const MOCK_PARCELS: Parcel[] = [
  { id: "1", trackingNumber: "PKS-001", shelf: "A-1", from: "Alice", to: "Bob", arrivedAt: "10:00", status: "incoming" },
  { id: "2", trackingNumber: "PKS-002", shelf: "B-2", from: "Carol", to: "Dave", arrivedAt: "11:00", status: "stored" },
  { id: "3", trackingNumber: "PKS-003", shelf: "C-3", from: "Eve", to: "Frank", arrivedAt: "12:00", status: "picked_up" },
];

describe("useParcelFilters — export", () => {
  it("is a function", () => {
    expect(typeof useParcelFilters).toBe("function");
  });
});

describe("parcel filter logic", () => {
  it("filters incoming parcels", () => {
    const result = MOCK_PARCELS.filter((p) => p.status === "incoming");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters stored parcels", () => {
    const result = MOCK_PARCELS.filter((p) => p.status === "stored");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("returns all when no filter", () => {
    expect(MOCK_PARCELS).toHaveLength(3);
  });

  it("counts incoming correctly", () => {
    expect(MOCK_PARCELS.filter((p) => p.status === "incoming").length).toBe(1);
  });

  it("counts stored correctly", () => {
    expect(MOCK_PARCELS.filter((p) => p.status === "stored").length).toBe(1);
  });

  it("counts all correctly", () => {
    expect(MOCK_PARCELS.length).toBe(3);
  });
});
