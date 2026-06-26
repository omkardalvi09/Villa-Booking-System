import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Villas from "./Pages/Villas";
import Rooms from "./Pages/Rooms";
import SingleRoom from "./Pages/SingleRoom";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import About from "./Pages/About";
import MyBookings from "./Pages/MyBookings";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { Toaster } from "react-hot-toast";
import { useContext } from "react";
import { AppContext } from "./Context/AppContext";
import OwnerLayout from "./Pages/owner/OwnerLayout";
import AllVillas from "./Pages/owner/AllVillas";
import RegisterVilla from "./Pages/owner/RegisterVilla";
import Bookings from "./Pages/owner/Bookings";
import AllRooms from "./Pages/owner/AllRooms";
import AddRoom from "./Pages/owner/AddRoom";
import Loader from "./Components/Loader";
import SingleVilla from "./Pages/SingleVilla";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import OwnerEarnings from "./Pages/owner/OwnerEarnings";
import Favourites from "./Pages/Favourites";
import BlockedDates from "./Pages/owner/BlockedDates";

function App() {
  const ownerPath = useLocation().pathname.includes("owner");
  const { owner } = useContext(AppContext);
  return (
    <>
      <Toaster />
      {!ownerPath && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/villas" element={<Villas />} />
        <Route path="/villa/:id" element={<SingleVilla />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/room/:id" element={<SingleRoom />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/loader/:nextUrl" element={<Loader />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/favourites" element={<Favourites />} />

        <Route path="/owner" element={owner ? <OwnerLayout /> : <Login />}>
          <Route index element={owner ? <AllVillas /> : <Login />} />
          <Route
            path="register-villa"
            element={owner ? <RegisterVilla /> : <Login />}
          />
          <Route
            path="register-villa/:id"
            element={owner ? <RegisterVilla /> : <Login />}
          />
          <Route path="rooms" element={owner ? <AllRooms /> : <Login />} />
          <Route path="add-room" element={owner ? <AddRoom /> : <Login />} />
          <Route
            path="add-room/:id"
            element={owner ? <AddRoom /> : <Login />}
          />
          <Route path="bookings" element={owner ? <Bookings /> : <Login />} />
          <Route
            path="earnings"
            element={owner ? <OwnerEarnings /> : <Login />}
          />
          <Route
            path="blocked-dates"
            element={owner ? <BlockedDates /> : <Login />}
          />
        </Route>
      </Routes>
      {!ownerPath && <Footer />}
    </>
  );
}

export default App;
