import e from "express";
import Stripe from "stripe"
import Booking from "../models/bookingModel.js";
import Car from "../models/carModel.js";
import User from "../models/userModel.js";
const stripe = new Stripe(process.env.Stripe_Private_Api_Key);
const client_domain = process.env.CLIENT_DOMAIN;
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

export const createPayment = async (req, res, next) => {
    try {
      const { products } = req.body;
  
      const lineItems = products.map((product) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: product?.carId?.name,
            description: product?.carId?.model,
            images: Array.isArray(product?.carId?.carpic) ? product?.carId?.carpic : [product?.carId?.carpic],
          },
          unit_amount: Math.round(product?.carId?.rentalcharge * 100),
        },
        quantity: 1,
      }));
  
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${client_domain}/user/paymentsuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${client_domain}/user/paymentcancel`,
      });
  
      res.json({ success: true, sessionId: session.id });
    } catch (error) {
      res.status(error.statusCode || 500).json(error.message || "internal server error");
    }
  };
  
export const getPaymentStatus = async (req, res, next) => {
    try {
        const sessionId = req.query.session_id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.send({
            status: session?.status,
            customer_email: session?.customer_details?.email,
        });
    } catch (error) {
        res.status(error?.statusCode || 500).json(error.message || "internal server error");
    }
}

dayjs.extend(utc);
dayjs.extend(timezone);

export const paymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ error: 'Missing session ID' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment failed or was not completed' });
    }

    const {
      userId,
      carId,
      startdate,
      enddate,
      pickuplocation,
      dropofflocation,
      rentalcharge
    } = req.body;

    if (!userId || !carId || !startdate || !enddate || !rentalcharge) {
      return res.status(400).json({ error: 'Missing required booking details' });
    }

    const startTime = dayjs.utc(startdate).tz('Asia/Kolkata');
    const endTime = dayjs.utc(enddate).tz('Asia/Kolkata');
    const localStartDate = startTime.format('DD-MMM-YYYY hh:mm A');
    const localEndDate = endTime.format('DD-MMM-YYYY hh:mm A');

    const user = await User.findById(userId);
    const car = await Car.findById(carId);
    if (!user || !car) {
      return res.status(404).json({ error: 'User or Car not found' });
    }

    const alreadyBooked = await Booking.findOne({
      carId,
      bookingstatus: { $ne: 'cancelled' },
      startdate: { $lt: endTime.toISOString() },
      enddate: { $gt: startTime.toISOString() }
    });
    if (alreadyBooked) {
      return res.status(400).json({
        success: false,
        message: 'Car is already booked for this time period'
      });
    }

    const booking = new Booking({
      userId: user._id,
      username: user.name,
      useremail: user.email,
      userphone: user.phone,
      carId: car._id,
      carname: car.name,
      carnumber: car.carnumber,
      carbaserent: car.rent,
      startdate: startTime.toISOString(),
      enddate: endTime.toISOString(),
      localstartdate: localStartDate,
      localenddate: localEndDate,
      pickuplocation,
      dropofflocation,
      rentalcharge,
      bookingstatus: 'confirmed',
      paymentstatus: 'paid'
    });

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking successful and payment confirmed',
      bookingDetails: booking,
    });

  } catch (error) {
    console.error('Error in paymentSuccess:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
