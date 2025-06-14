// server/routes/socialAuthRoutes.js
const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

// Fungsi untuk menghasilkan token JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" }
  );
};

// Google OAuth Routes
router.get("/google", (req, res, next) => {
  console.log("Starting Google OAuth flow...");
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
  console.log("Callback URL:", "http://localhost:3000/api/auth/google/callback");
  next();
}, passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    console.log("Google authentication successful, user:", req.user);
    // Berhasil autentikasi, hasilkan token JWT
    const token = generateToken(req.user);

    // Redirect ke frontend dengan token
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/social-auth-success?token=${token}`);
  }
);

// Facebook OAuth Routes
router.get("/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get("/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    // Berhasil autentikasi, hasilkan token JWT
    const token = generateToken(req.user);

    // Redirect ke frontend dengan token
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/social-auth-success?token=${token}`);
  }
);

// Twitter OAuth Routes
router.get("/twitter",
  passport.authenticate("twitter")
);

router.get("/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  (req, res) => {
    // Berhasil autentikasi, hasilkan token JWT
    const token = generateToken(req.user);

    // Redirect ke frontend dengan token
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/social-auth-success?token=${token}`);
  }
);

module.exports = router;
