import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import Report from "./pages/Report";
import History from "./pages/History";
import RankTracker from "./pages/RankTracker";
import RankDetail from "./pages/RankDetail";
import Tools from "./pages/tools/Tools";
import MetaTagChecker from "./pages/tools/MetaTagChecker";
import SerpPreview from "./pages/tools/SerpPreview";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import { Toaster } from "react-hot-toast";
import { useApp } from "./context/AppContext";
import Loading from "./components/Loading";
import PageMeta from "./components/PageMeta";


export default function App() {
    const {user,loading} = useApp()
    const location = useLocation();

    const hideNavbar = ["/login", "/register"].includes(location.pathname);

    if(loading) return <><PageMeta />< Loading /></>

    return (
        <>
            <PageMeta />
            <Toaster />
            {!hideNavbar && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/tools/meta-tag-checker" element={<MetaTagChecker />} />
                <Route path="/tools/serp-preview" element={<SerpPreview />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/login" element={user? <Navigate to="/dashboard" replace/> :
                <Login state="login" />} />

                <Route path="/register" element={user? <Navigate to="/dashboard" replace/> :
                <Login state="register" />} />
                
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analyze" element={<Analyze />} />
                    <Route path="/report/:id" element={<Report />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/rank-tracker" element={<RankTracker />} />
                    <Route path="/rank/:id" element={<RankDetail />} />
                </Route>
            </Routes>
        </>
    );
}
