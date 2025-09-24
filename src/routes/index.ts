import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { getProfile } from "../controllers/user.controller";
import { createService, listServices } from "../controllers/service.controller";
import { createBooking, listBookings } from "../controllers/booking.controller";
import { verifyJWT } from "../middlewares/verify";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);

router.get("/users/me", verifyJWT, getProfile);
router.post("/services", verifyJWT, createService);
router.get("/services", listServices);
router.post("/bookings", verifyJWT, createBooking);
router.get("/bookings", verifyJWT, listBookings);

export default router;
