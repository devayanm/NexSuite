import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

// Pages
import Login from "./Pages/Login";
import Home from "./Pages/Home/Home";
import Lists from "./Pages/Lists/Lists";
import SendEmail from "./Pages/SendEmail/SendEmail";
import ViewEmails from "./Pages/ViewEmail/ViewEmails";
import EmailDetails from "./Pages/EmailDetails";
import Contacts from "./Pages/Contact/Contacts";
import Templates from "./Pages/Templates/Templates";
import Groups from "./Pages/Groups/Groups";

// Components
import ProtectedRoute from "./Components/ProtectedRoute";

// Layout
import Layout from "./Pages/Layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<ProtectedRoute element={Home} />} />
          <Route path="lists" element={<ProtectedRoute element={Lists} />} />
          <Route
            path="email/:id"
            element={<ProtectedRoute element={EmailDetails} />}
          />
          <Route
            path="send-email"
            element={<ProtectedRoute element={SendEmail} />}
          />
          <Route
            path="view-emails"
            element={<ProtectedRoute element={ViewEmails} />}
          />
          <Route
            path="contact"
            element={<ProtectedRoute element={Contacts} />}
          />
          <Route
            path="templates"
            element={<ProtectedRoute element={Templates} />}
          />
          <Route path="groups" element={<ProtectedRoute element={Groups} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
