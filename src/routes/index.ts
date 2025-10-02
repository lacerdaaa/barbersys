import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { getProfile } from "../controllers/user.controller";
import { createService, deleteService, listServices, updateService, listServiceBarbers } from "../controllers/service.controller";
import { createBooking, listBookings, updateBookingStatus, checkAvailability } from "../controllers/booking.controller";
import { verifyJWT } from "../middlewares/verify";
import { createBarberShop, createInvite, getBarberShopById, getBarberShops, getMyBarberShop, updateBarberShop } from "../controllers/barbershop.controller";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/users/me", verifyJWT, getProfile);

router.get("/services", listServices);
router.post("/services", verifyJWT, createService);
router.put("/services/:serviceId", verifyJWT, updateService);
router.delete("/services/:serviceId", verifyJWT, deleteService);
router.get("/services/:serviceId/barbers", listServiceBarbers);

router.post("/bookings", verifyJWT, createBooking);
router.get("/bookings", verifyJWT, listBookings);
router.patch("/bookings/:bookingId", verifyJWT, updateBookingStatus);
router.get("/bookings/availability", checkAvailability);

router.get("/barber-shops", getBarberShops);
router.get("/barber-shop/:barbershopId", verifyJWT, getBarberShopById);
router.post("/barber-shop", verifyJWT, createBarberShop);
router.post("/barber-shop/invite", verifyJWT, createInvite);
router.get("/me/barber-shop", verifyJWT, getMyBarberShop);
router.patch("/barber-shop/:barbershopId", verifyJWT, updateBarberShop);

export default router;
