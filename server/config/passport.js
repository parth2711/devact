const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
        scope: ['user:email'],
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          if (req.session && req.session.connectUserId) {
            let user = await User.findById(req.session.connectUserId);
            if (user) {
              user.githubId = profile.id;
              user.isGithubVerified = true;
              if (!user.githubUsername) {
                user.githubUsername = profile.username;
              }
              await user.save();
              req.session.connectUserId = null;
              return done(null, user);
            }
          }

          // Try to find user by githubId
          let user = await User.findOne({ githubId: profile.id });

          if (!user) {
            // If not found, try to find by email
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            
            if (email) {
              user = await User.findOne({ email });
            }

            if (user) {
              // User exists with this email, link github
              user.githubId = profile.id;
              user.isGithubVerified = true;
              if (!user.githubUsername) {
                user.githubUsername = profile.username;
              }
              await user.save();
            } else {
              // Create new user
              user = await User.create({
                name: profile.displayName || profile.username,
                email: email || `${profile.username}@github.devact.local`, // Fallback email
                githubId: profile.id,
                isGithubVerified: true,
                githubUsername: profile.username,
                avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn('[Auth] GitHub OAuth is disabled: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing from environment variables.');
}

// We won't strictly use serialize/deserialize for session-based auth persistence,
// because we use JWT, but passport requires it if using session.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
