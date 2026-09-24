import {
  Navigate,
  Outlet,
} from "react-router-dom";

import useAuth from "../features/auth/useAuth";

const RoleRoute = ({
  allowedRoles = [],
}) => {
  const {
    user,
    initializing,
  } = useAuth();

  if (initializing) {
    return null;
  }

  if (
    !user ||
    !allowedRoles.includes(
      user.role
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
};

export default RoleRoute;