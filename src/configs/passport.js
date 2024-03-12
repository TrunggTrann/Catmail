const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const Account = require("../models/Account")
const Admin = require("../models/Admin")

const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
// Cấu hình Passport cho đăng nhập với Local Strategy
// // Define the LocalStrategy for regular users
passport.use('user-local', new LocalStrategy({
    usernameField: 'email', // thay vì 'username' mặc định
    passwordField: 'password'
  }, (email, password, done) => {
	// Tìm kiếm người dùng trong cơ sở dữ liệu
	Account.findOne({ email: email }, (err, user) => {
		if (err) { return done(err); }
		if (!user) {
		  return done(null, false, { status: 'failure', message: 'Tên đăng nhập không đúng.' });
		}
		// So sánh mật khẩu được mã hóa với mật khẩu đã lưu trong cơ sở dữ liệu
		bcrypt.compare(password, user.password, (err, res) => {
			if (res) {
				// Nếu mật khẩu khớp, trả về người dùng
				const jwtToken = { email, role: user.role, isLocked: user.isLocked, _id: user._id }
                const token = jwt.sign(jwtToken, process.env.SECRET_KEY_JWT)
				done(null, token);
			} else {
				// Nếu mật khẩu không khớp, trả về thông báo lỗi
				return done(null, false, { status: 'failure', message: 'Mật khẩu không đúng.' });
			}
		});
	  });
	}
));
// // Define the LocalStrategy for admin users
passport.use('admin-local', new LocalStrategy(
	function(username, password, done) {
		Admin.findOne({ username: username }, function (err, user) {
			if (err) { return done(err); }
			if (!user) {
				req.flash('failure', 'Tên đăng nhập không đúng.');
				return done(null, false, { status: 'failure', message: 'Tên đăng nhập không đúng.' });
			}
			// So sánh mật khẩu được mã hóa với mật khẩu đã lưu trong cơ sở dữ liệu
			bcrypt.compare(password, user.password, (err, res) => {
				if (res) {
					// Nếu mật khẩu khớp, trả về người dùng
					const jwtToken = { username, role: "admin", _id: user._id }
					const token = jwt.sign(jwtToken, process.env.SECRET_KEY_JWT)
					done(null, token);
				} else {
					// Nếu mật khẩu không khớp, trả về thông báo lỗi
					req.flash('failure', 'Mật khẩu không đúng.');
					return done(null, false, { status: 'failure', message: 'Mật khẩu không đúng.' });
				}
			});
		});
	}
  ));

// Cấu hình Passport cho đăng nhập với Google
passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret:  process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: "http://localhost:8080/api/auth/google/callback"
	}, async (accessToken, refreshToken, profile, done) => {
		try {
			// Tìm kiếm hoặc tạo người dùng mới với thông tin từ Google
			const user = await Account.findOne({ googleId: profile.id });
			if (user) {
                const jwtToken = { email: profile.emails[0].value, role: user.role, isLocked: user.isLocked, _id: user._id }
                const token = jwt.sign(jwtToken, process.env.SECRET_KEY_JWT)
				done(null, token);
			} else {
            
				const newUser = await Account.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    role: "user",
                    isLocked: false,
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    avatar: profile.photos[0].value,
                    googleId: profile.id
                });
                newUser.save()
				done(null, newUser);
			}
		} catch (error) {
			done(error, null);
		}
}));
//Lưu vào session
passport.serializeUser(function(user, done) {
	done(null, user);
});
//Lấy từ session
passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});
