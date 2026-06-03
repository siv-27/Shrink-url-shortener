import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    setUser(null);
    setWorkspaces([]);
    setActiveWorkspace(null);
    setAuditLogs([]);
    setLoading(false);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/auth/profile");

      setUser(res.data.user);
      setAuditLogs(res.data.logs || []);

      const wsRes = await api.get("/workspaces");
      setWorkspaces(wsRes.data || []);
    } catch (err) {
      console.error("Failed to load user profile", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        await fetchProfile();
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [fetchProfile]);

  const login = async (email, password) => {
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      if (res.data.refreshToken) {
        localStorage.setItem(
          "refreshToken",
          res.data.refreshToken
        );
      }

      await fetchProfile();

      return res.data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      if (res.data.refreshToken) {
        localStorage.setItem(
          "refreshToken",
          res.data.refreshToken
        );
      }

      await fetchProfile();

      return res.data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const switchWorkspace = (workspaceId) => {
    const selected = workspaces.find(
      (workspace) => workspace._id === workspaceId
    );

    setActiveWorkspace(selected || null);
  };

  const reloadWorkspaces = useCallback(async () => {
    try {
      const wsRes = await api.get("/workspaces");

      setWorkspaces(wsRes.data || []);

      if (activeWorkspace) {
        const updatedActive = wsRes.data.find(
          (workspace) =>
            workspace._id === activeWorkspace._id
        );

        setActiveWorkspace(updatedActive || null);
      }
    } catch (err) {
      console.error("Failed to reload workspaces", err);
    }
  }, [activeWorkspace]);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspace,
        loading,
        auditLogs,
        login,
        register,
        logout,
        switchWorkspace,
        fetchProfile,
        reloadWorkspaces,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}