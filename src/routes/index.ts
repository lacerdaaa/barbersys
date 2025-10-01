import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { getProfile } from "../controllers/user.controller";
import { createService, deleteService, listServices, updateService } from "../controllers/service.controller";
import { createBooking, listBookings, updateBookingStatus } from "../controllers/booking.controller";
import { verifyJWT } from "../middlewares/verify";
import { createBarberShop, createInvite, getBarberShopById } from "../controllers/barbershop.controller";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/users/me", verifyJWT, getProfile);

router.get("/services", listServices);
router.post("/services", verifyJWT, createService);
router.put("/services/:serviceId", verifyJWT, updateService);
router.delete("/services/:serviceId", verifyJWT, deleteService);

router.post("/bookings", verifyJWT, createBooking);
router.get("/bookings", verifyJWT, listBookings);
router.patch("/bookings/:serviceId", verifyJWT, updateBookingStatus);

router.get("/barber-shops", getBarberShopById)
router.get("/barber-shop/:barbershopId", verifyJWT, getBarberShopById);
router.post("/barber-shop", verifyJWT, createBarberShop);
router.post("/barber-shop/invite", verifyJWT, createInvite);

export default router;
