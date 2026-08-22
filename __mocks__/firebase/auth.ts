const mockOnAuthStateChanged = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockGetAuth = jest.fn(() => ({
  currentUser: null,
}));

const mockUser = {
  uid: "test-user-uid",
  email: "test@example.com",
  displayName: null,
  photoURL: null,
};

export {
  mockOnAuthStateChanged as onAuthStateChanged,
  mockSignInWithEmailAndPassword as signInWithEmailAndPassword,
  mockCreateUserWithEmailAndPassword as createUserWithEmailAndPassword,
  mockSignOut as signOut,
  mockGetAuth as getAuth,
  mockUser,
};

export const __mocks__ = {
  onAuthStateChanged: mockOnAuthStateChanged,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  getAuth: mockGetAuth,
};
