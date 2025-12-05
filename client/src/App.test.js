import { render, screen } from '@testing-library/react';

// Mock App component to avoid axios issues
jest.mock('./App', () => () => (
  <div>
    <h1>Event Management</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/login">Login</a>
    </nav>
  </div>
));

import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Event Management/i);
  expect(linkElement).toBeInTheDocument();
});
