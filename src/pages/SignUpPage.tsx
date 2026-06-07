import { Navigate } from 'react-router-dom';

// The full signup flow lives inside LoginPage (role picker → signup form).
// Redirect here so all "Start Free" / "Sign up" buttons land on the right screen.
export default function SignUpPage() {
  return <Navigate to="/login?mode=signup" replace />;
}
