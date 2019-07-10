function checkHttps(req, res, next){
    // protocol check, if http, redirect to https
    
    if(req.get('X-Forwarded-Proto').indexOf("https")!=-1){
      return next();
    } else {
      res.redirect('https://' + req.hostname + req.url);
    }
  }
  
  app.all('*', checkHttps);


  const ejs = require('ejs');
  const fs = require('fs');
  const passport = require('passport');
  const bodyParser = require('body-parser');
  const session = require('express-session');
  const DiscordStrategy = require('passport-discord').Strategy;
  var port = process.env.PORT;
  
  passport.serializeUser(function(user, done) {
      done(null, user);
    });
    passport.deserializeUser(function(obj, done) {
      done(null, obj);
    });
  function checkAuth(req, res, next) {
      if (req.isAuthenticated()) return next();
      res.redirect('/');
  };
  app.use(express.static('static'));
  app.set('view engine', 'ejs');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.set('port', port);
  
  passport.use(new DiscordStrategy({
      clientID: '466872484684234752',
      clientSecret: process.env.clientsecret,
      callbackURL: 'https://www.sayuka.com/callback',
      scope: ['identify']
    
  }, function(accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
          return done(null, profile);
      });
  }));
  
  app.use(session({
      secret: 'sayukadash',
      resave: false,
      saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.get('/login', passport.authenticate('discord', { scope: ['identify'] }), function(req, res) {});
  app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/'+req.user.id) });
  app.get('/', function(req, res){
  res.render('index');
  });
  app.get('/commands', function(req, res){
  res.render('commands');
  });
  app.get('/:userID', checkAuth, function(req, res){
  res.render('index', {username: req.user.username, useravatar: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png?size=2048`});
  });
  app.get('/logout', checkAuth, function(req, res) {
      req.logout();
      res.redirect('/');
  });
  app.use(function(req, res) {
    res.redirect('/');
  });
  app.listen(port);