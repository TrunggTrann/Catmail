const authRoute = require('./auth.route')
const accountRoute = require('./account.route')
const homeRoute = require('./home.route')
const adminRoute = require('./admin.route')
const mailRoute = require('./mail.route')

const { requireLogin, redirectAccount, isAccountLocked } = require('../middlewares/checkAccount')

	
const setRoutes = (app) => {
	app.get('/admin/login', (req, res) => res.render('admin/login'))
	app.get('/login', (req, res) => res.render('login'))
	app.get('/signup', (req, res) => res.render('signup'))
 
	app.use('/api/auth/', authRoute)

	
	app.use('/admin',requireLogin , adminRoute)
	// app.use('/', requireLogin,accountRoute)

	
	//phương thức trả về trang cho user, admin khi đăng nhập thành công
	app.use('/api/account/',  requireLogin, isAccountLocked, accountRoute)
	app.use('/api/mail/',  requireLogin, isAccountLocked, mailRoute)
	
	app.use('/', requireLogin, isAccountLocked, homeRoute)

		
	//phương thức trả về trang cho user hoặc admin khi đăng nhập thành công
	app.use('/login-success', redirectAccount);

	// phương thức xử lý trang báo lỗi không có quyền truy cập
	app.get('/not-authorized', (req, res) => {
		res.status(403).send('<h1>Bạn không có quyền truy cập vào trang này.</h1>');
	});

	// Khi một yêu cầu không khớp với bất kỳ router nào khác, trả về trang 404
	app.use(function(req, res, next) {
		res.render('404')
	});
  
	app.use((err, req, res, next) => {
		res.status(500).json(apiFailure(err.message))
	})

	// app.post('/compose', upload.single('item'), accountRoute)


	


}
module.exports = setRoutes