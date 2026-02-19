import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Layout } from "./components/Layout";
import { GuestRoute } from "./components/GuestRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { JobDetail } from "./pages/JobDetail";
import { CreateJob } from "./pages/CreateJob";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { UserProfile } from "./pages/UserProfile";

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/jobs/new" element={<CreateJob />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/update-profile" element={<UserProfile />} />
          </Route>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
