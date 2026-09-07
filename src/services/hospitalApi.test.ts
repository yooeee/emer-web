import { normalizeHospitals, searchHospitals } from "./hospitalApi";
import { phoneHref } from "../types/hospital";

const row = {
  hpid: "fixture-1",
  dutyName: "테스트 의료기관",
  dutyAddr: "테스트 주소",
  wgs84Lon: "127.1",
  wgs84Lat: "37.5",
};

test("accepts the upstream single-object response and deduplicates repeated facilities", () => {
  expect(normalizeHospitals(row)[0]).toEqual(
    expect.objectContaining({
      id: "fixture-1",
      name: "테스트 의료기관",
      coordinates: [127.1, 37.5],
    }),
  );
  expect(normalizeHospitals([row, row])).toHaveLength(1);
  expect(normalizeHospitals(null)).toEqual([]);
});

test.each([
  { wgs84Lon: "", wgs84Lat: "" },
  { wgs84Lon: "NaN", wgs84Lat: "37" },
  { wgs84Lon: "127", wgs84Lat: "100" },
  { wgs84Lon: "0", wgs84Lat: "0" },
])(
  "retains hospital contact information when coordinates are invalid: %o",
  (coordinates) => {
    const result = normalizeHospitals({
      ...row,
      ...coordinates,
      dutyTel3: "02-000-0002",
    });
    expect(result[0].coordinates).toBeNull();
    expect(result[0].emergencyPhone).toBe("02-000-0002");
  },
);

test("does not turn malformed API data into a successful empty search", () => {
  expect(() => normalizeHospitals("upstream error")).toThrow();
  expect(() => normalizeHospitals({ message: "failed" })).toThrow();
});

test("only creates telephone links for supplied numbers", () => {
  expect(phoneHref("02-1234-5678")).toBe("tel:0212345678");
  expect(phoneHref("정보 없음")).toBeUndefined();
  expect(phoneHref("")).toBeUndefined();
});

test("treats an HTML fallback page and API result-code errors as failures", async () => {
  const originalFetch = global.fetch;
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new SyntaxError("HTML fallback");
      },
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ resultCode: 500, result: null }),
    });
  const query = {
    region: "서울특별시",
    district: "",
    name: "",
    type: "getEgytListInfoInqire" as const,
  };
  try {
    await expect(
      searchHospitals(query, new AbortController().signal),
    ).rejects.toThrow("정보를 불러오지 못했어요");
    await expect(
      searchHospitals(query, new AbortController().signal),
    ).rejects.toThrow("정보를 불러오지 못했어요");
  } finally {
    global.fetch = originalFetch;
  }
});
