const rateLimit = require('express-rate-limit');
const { logEvents } = require('./logger');

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5, //Limit each ip to 5 login req pr window pr minute
    message: {
        message:
            'Too many login attemtps from thi IP, please try again after a 60 second pause',
    },
    handler: (req, res, next, options) => {
        logEvents(
            `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
            'errLog.log'
        );
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true, //return rate limit info if in the Ratelimit-* headers
    legacyHeaders: false, // Disable the X=RateLimit-* headers
});

module.exports = loginLimiter;
