import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import PublicLayout from "./components/publicLayout";
import Home from "./pages/public/Home";

// Smooth scroll to #hash section
function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    // Only handle on home route
    if (pathname !== "/") return;

    if (!hash) {
      // No hash: go to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash, pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route path="*" element={<div className="p-10">404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
