const mockDb = {
  _mockDb: true,
};

const mockAuth = {
  _mockAuth: true,
  currentUser: null,
};

const mockApp = {
  _mockApp: true,
};

export function getFirebaseDb() {
  return mockDb;
}

export function getFirebaseAuth() {
  return mockAuth;
}

export function getFirebaseApp() {
  return mockApp;
}

export { mockDb, mockAuth, mockApp };

const firebaseMock = {
  getFirebaseDb,
  getFirebaseAuth,
  getFirebaseApp,
  mockDb,
  mockAuth,
  mockApp,
};

export default firebaseMock;
