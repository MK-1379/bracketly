import { createBrowserRouter } from "react-router";
import { RequireAuth } from "./auth/RequireAuth";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { JoinTeamPage } from "./pages/JoinTeamPage";
import { LoginPage } from "./pages/LoginPage";
import { ManageTournamentPage } from "./pages/ManageTournamentPage";
import { NewTeamPage } from "./pages/NewTeamPage";
import { NewTournamentPage } from "./pages/NewTournamentPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PanelPage } from "./pages/PanelPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ReportMatchPage } from "./pages/ReportMatchPage";
import { TeamPanelPage } from "./pages/TeamPanelPage";
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
                children: [
                    { path: "panel", element: <PanelPage /> },
                    { path: "panel/torneos/nuevo", element: <NewTournamentPage /> },
                    { path: "panel/torneos/:slug", element: <ManageTournamentPage /> },
                    { path: "panel/equipos/nuevo", element: <NewTeamPage /> },
                    { path: "panel/equipos/:id", element: <TeamPanelPage /> },
                    { path: "unirse/:code", element: <JoinTeamPage /> },
                    { path: "partidos/:id/reportar", element: <ReportMatchPage /> },
                ],
            },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);