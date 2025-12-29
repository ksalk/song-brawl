
// import { createBrowserRouter } from "react-router-dom";
// import Home from "./Home";
// import BrawlRoom from "./BrawlRoom";

// // Define your routes
// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Home />,
//   },
//   {
//     path: "/brawl/:brawlId",
//     element: <BrawlRoom />,
//   },
// ]);

// export default router;

// Import the generated route tree
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({
    routeTree
  })
  return router
}