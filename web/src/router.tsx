import { createBrowserRouter } from "react-router";
import { RequireAuth } from "./auth/RequireAuth";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PanelPage } from "./pages/PanelPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TournamentPage } from "./pages/TournamentPage";

export const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "torneos/:slug", element: <TournamentPage /> },
            { path: "entrar", element: <LoginPage /> },
            { path: "registro", element: <RegisterPage /> },
            {
                element: <RequireAuth />,
                children: [{ path: "panel", element: <PanelPage /> }],
            },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);