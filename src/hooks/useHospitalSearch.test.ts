import { act, renderHook } from "@testing-library/react";
import useHospitalSearch from "./useHospitalSearch";
import { searchHospitals } from "../services/hospitalApi";
import { Hospital } from "../types/hospital";

jest.mock("../services/hospitalApi");
const mockedSearch = searchHospitals as jest.MockedFunction<
  typeof searchHospitals
>;
const query = {
  region: "서울특별시",
  district: "",
  type: "getEgytListInfoInqire" as const,
  name: "",
};
const hospital: Hospital = {
  id: "fixture-1",
  name: "테스트 의료기관",
  category: "",
  address: "",
  phone: "",
  emergencyPhone: "",
  coordinates: null,
};

test("an older response cannot replace a newer search", async () => {
  let finishFirst!: (value: Hospital[]) => void;
  mockedSearch
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishFirst = resolve;
        }),
    )
    .mockResolvedValueOnce([]);
  const { result } = renderHook(() => useHospitalSearch());
  act(() => {
    void result.current.search(query);
  });
  const firstSignal = mockedSearch.mock.calls[0][1];
  await act(async () => {
    await result.current.search({ ...query, region: "부산광역시" });
  });
  expect(firstSignal.aborted).toBe(true);
  await act(async () => {
    finishFirst([hospital]);
  });
  expect(result.current.hospitals).toEqual([]);
  expect(result.current.query?.region).toBe("부산광역시");
});

test("reset cancels in-flight requests and leaves the initial state intact", async () => {
  let finish!: (value: Hospital[]) => void;
  mockedSearch.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const { result } = renderHook(() => useHospitalSearch());
  act(() => {
    void result.current.search(query);
  });
  act(() => {
    result.current.reset();
  });
  await act(async () => {
    finish([hospital]);
  });
  expect(result.current.status).toBe("idle");
  expect(result.current.hospitals).toEqual([]);
  expect(result.current.query).toBeNull();
});
