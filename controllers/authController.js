const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
	const { username, password } = req.body

	// console.log(password)

	if (!username || !password) {
		return res.status(400).json({ message: 'All fields are requiered' })
	}

	const foundUser = await User.findOne({ username }).exec() //Looking for user in mongoDB

	if (!foundUser || !foundUser.active) {
		//active is the boolean variable that can be changed by admin to deny access
		return res.status(401).json({ message: 'Unauthorized' })
	}

	const match = await bcrypt.compare(password, foundUser.password)

	if (!match) return res.status(401).json({ message: 'Unauthorized' })

	//prettier-ignore
	const accesToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles,
            },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1m' }
    );

	//prettier-ignore
	const refreshToken = jwt.sign(
        {"username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:'1d'}
    )

	//Create secure cookie with refresh token
	res.cookie('jwt', refreshToken, {
		httpOnly: true, //accessable only by web server, unlike JS
		secure: true, //https
		sameSite: 'None', //cross-site cookie
		maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry set to 7days
	})

	//Send accesstoken containing username and roles
	res.json({ accesToken })
})

// @desc Refresh
// @route GET /auth/refresh
// @access Public
const refresh = asyncHandler(async (req, res) => {
	const cookies = req.cookies
	if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })
	const refreshToken = cookies.jwt

	//prettier-ignore
	jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) {
				console.log(err) ;
				return res.status(403).json({ message: 'Forbidden' })
			}
            const foundUser = await User.findOne({
                username: decoded.username,
            }).exec();
            if (!foundUser)
                return res.status(401).json({ message: 'Unauthorized' });

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1m' }
            );

            res.json({ accessToken });
        })
    );
})

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
	const cookies = req.cookies
	if (!cookies?.jwt) return res.sendStatus(204) //no content
	res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
	res.json({ message: 'Cookie cleared' })
}

module.exports = {
	login,
	refresh,
	logout,
}
