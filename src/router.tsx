
import { createBrowserRouter } from "react-router-dom";
import Home from "./Home";
import BrawlRoom from "./BrawlRoom";

// Define your routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/brawl/:brawlId",
    element: <BrawlRoom />,
  },
]);

export default router;

  