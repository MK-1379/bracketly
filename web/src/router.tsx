import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { TournamentPage } from "./pages/TournamentPage";

export const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "torneos/:slug", element: <TournamentPage /> },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);
