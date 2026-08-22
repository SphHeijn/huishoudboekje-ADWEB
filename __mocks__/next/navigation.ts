const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

let mockParamsValue: Record<string, string> = {};
let mockPathname = "/";

function setMockParams(params: Record<string, string>) {
  mockParamsValue = params;
}

function setMockPathname(pathname: string) {
  mockPathname = pathname;
}

export function useRouter() {
  return mockRouter;
}

export function useParams() {
  return mockParamsValue;
}

export function usePathname() {
  return mockPathname;
}

export function useSearchParams() {
  return new URLSearchParams();
}

export { mockRouter, setMockParams, setMockPathname };

const nextNavigation = {
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
  mockRouter,
  setMockParams,
  setMockPathname,
};

export default nextNavigation;
