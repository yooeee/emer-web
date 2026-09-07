import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import App from "./App";
import { getDistricts, searchHospitals } from "./services/hospitalApi";
import { Hospital } from "./types/hospital";

jest.mock("./services/hospitalApi");
jest.mock("./components/HospitalMap", () => () => (
  <div data-testid="hospital-map" />
));

const hospital: Hospital = {
  id: "fixture-1",
  name: "테스트 의료기관",
  address: "테스트 주소",
  category: "지역응급의료센터",
  phone: "02-000-0001",
  emergencyPhone: "02-000-0002",
  coordinates: [127, 37.5],
};
const mockedDistricts = getDistricts as jest.MockedFunction<
  typeof getDistricts
>;
const mockedSearch = searchHospitals as jest.MockedFunction<
  typeof searchHospitals
>;

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
beforeEach(() => {
  jest.resetAllMocks();
  mockedDistricts.mockResolvedValue([]);
});

test("starts without invented results and validates the required region", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "가까운 응급의료기관",
  );
  expect(mockedSearch).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "의료기관 찾기" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("시·도를 먼저 선택");
  expect(screen.getByLabelText(/시·도/)).toHaveFocus();
});

test("searches with the selected district and opens details with an emergency phone link", async () => {
  mockedDistricts.mockResolvedValue([{ code: "11110", name: "종로구" }]);
  mockedSearch.mockResolvedValue([hospital]);
  render(<App />);
  fireEvent.change(screen.getByLabelText(/시·도/), { target: { value: "11" } });
  await screen.findByRole("option", { name: "종로구" });
  fireEvent.change(screen.getByLabelText("시·군·구"), {
    target: { value: "종로구" },
  });
  fireEvent.change(screen.getByLabelText(/병원 이름/), {
    target: { value: "  테스트  " },
  });
  fireEvent.submit(screen.getByRole("form", { name: "의료기관 검색" }));
  await screen.findByRole("button", { name: "테스트 의료기관 선택" });
  expect(mockedSearch).toHaveBeenCalledWith(
    {
      region: "서울특별시",
      district: "종로구",
      name: "테스트",
      type: "getEgytListInfoInqire",
    },
    expect.any(AbortSignal),
  );
  fireEvent.click(screen.getByRole("button", { name: "상세정보" }));
  const dialog = screen.getByRole("dialog");
  expect(
    within(dialog).getByRole("link", { name: "응급실에 전화하기" }),
  ).toHaveAttribute("href", "tel:020000002");
  expect(
    within(dialog).getByRole("link", { name: "네이버 지도에서 보기" }),
  ).toHaveAttribute("target", "_blank");
  fireEvent.click(within(dialog).getByRole("button", { name: "닫기" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("keeps failed searches distinct from empty results and supports retry and reset", async () => {
  mockedSearch
    .mockRejectedValueOnce(new Error("연결을 확인해 주세요."))
    .mockResolvedValueOnce([]);
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "서울" }));
  fireEvent.submit(screen.getByRole("form", { name: "의료기관 검색" }));
  await screen.findByText("잠시 연결이 원활하지 않아요");
  expect(
    screen.queryByText("검색된 의료기관이 없어요"),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "다시 검색하기" }));
  await screen.findByText("검색된 의료기관이 없어요");
  fireEvent.click(screen.getByRole("button", { name: "초기화" }));
  expect(screen.getByLabelText(/시·도/)).toHaveValue("");
  expect(screen.getByText("필요한 순간, 헤매지 않도록.")).toBeInTheDocument();
});

test("discards the previous district when a different province is selected", async () => {
  mockedDistricts
    .mockResolvedValueOnce([{ code: "11110", name: "종로구" }])
    .mockResolvedValueOnce([{ code: "26110", name: "중구" }]);
  mockedSearch.mockResolvedValue([]);
  render(<App />);
  fireEvent.change(screen.getByLabelText(/시·도/), { target: { value: "11" } });
  await screen.findByRole("option", { name: "종로구" });
  fireEvent.change(screen.getByLabelText("시·군·구"), {
    target: { value: "종로구" },
  });
  fireEvent.change(screen.getByLabelText(/시·도/), { target: { value: "26" } });
  await screen.findByRole("option", { name: "중구" });
  expect(screen.getByLabelText("시·군·구")).toHaveValue("");
  expect(
    screen.queryByRole("option", { name: "종로구" }),
  ).not.toBeInTheDocument();
  fireEvent.submit(screen.getByRole("form", { name: "의료기관 검색" }));
  await waitFor(() =>
    expect(mockedSearch).toHaveBeenCalledWith(
      expect.objectContaining({ region: "부산광역시", district: "" }),
      expect.any(AbortSignal),
    ),
  );
});
