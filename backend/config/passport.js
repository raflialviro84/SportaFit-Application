// server/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/userModel');

// Serialize user untuk session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user dari session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
console.log("Loading Google Strategy with:");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "1017948229051-83610r1cojni7g322lbdl1f3hngd7dhq.apps.googleusercontent.com",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "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",
    callbackURL: "http://localhost:3000/api/auth/google/callback",
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Cek apakah user sudah ada di database
      let user = await User.findOne({ where: { email: profile.emails[0].value } });

      if (user) {
        // Update user dengan data terbaru dari Google
        user.name = profile.displayName;
        user.google_id = profile.id;
        await user.save();
      } else {
        // Buat user baru jika belum ada
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          google_id: profile.id,
          password: Math.random().toString(36).slice(-8), // Generate random password
          role: 'user'
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
    callbackURL: "http://localhost:3000/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email'],
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Facebook tidak selalu memberikan email, jadi kita perlu menangani kasus ini
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`;

      // Cek apakah user sudah ada di database
      let user = await User.findOne({ where: { email } });

      if (user) {
        // Update user dengan data terbaru dari Facebook
        user.name = profile.displayName;
        user.facebook_id = profile.id;
        await user.save();
      } else {
        // Buat user baru jika belum ada
        user = await User.create({
          name: profile.displayName,
          email,
          facebook_id: profile.id,
          password: Math.random().toString(36).slice(-8), // Generate random password
          role: 'user'
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Twitter Strategy
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY || 'your-twitter-consumer-key',
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET || 'your-twitter-consumer-secret',
    callbackURL: "http://localhost:3000/api/auth/twitter/callback",
    includeEmail: true,
    passReqToCallback: true
  },
  async (req, token, tokenSecret, profile, done) => {
    try {
      // Twitter tidak selalu memberikan email, jadi kita perlu menangani kasus ini
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@twitter.com`;

      // Cek apakah user sudah ada di database
      let user = await User.findOne({ where: { email } });

      if (user) {
        // Update user dengan data terbaru dari Twitter
        user.name = profile.displayName;
        user.twitter_id = profile.id;
        await user.save();
      } else {
        // Buat user baru jika belum ada
        user = await User.create({
          name: profile.displayName,
          email,
          twitter_id: profile.id,
          password: Math.random().toString(36).slice(-8), // Generate random password
          role: 'user'
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
