import { Navigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ element: Component }) => {
  const safeGet = (key) => {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return raw;
    }
  };

  const token = safeGet("token");
  const rawExpires = safeGet("expiresIn");

  // Normalize expires to milliseconds since epoch
  let expiresMs = null;
  if (rawExpires == null) {
    expiresMs = 0;
  } else if (typeof rawExpires === "number") {
    expiresMs = rawExpires;
  } else if (typeof rawExpires === "string") {
    // try ISO date parse or numeric string
    const asNum = Number(rawExpires);
    if (!Number.isNaN(asNum)) {
      expiresMs = asNum;
    } else {
      const parsed = Date.parse(rawExpires);
      expiresMs = Number.isNaN(parsed) ? 0 : parsed;
    }
  } else if (rawExpires instanceof Date) {
    expiresMs = rawExpires.getTime();
  } else {
    expiresMs = 0;
  }

  const isAuth = token && expiresMs > Date.now();

  return isAuth ? <Component /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
