import "dotenv/config"
import express from "express"
import verifyFunction from "./utils/passport.js"
import crypto from "crypto"
import { prisma } from "./lib/prisma.js"
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local"

import { PrismaSessionStore } from '@quixo3/prisma-session-store';

import { hashPassword, verifyPassword } from "./utils/password.js"

const app = express()


passport.use(new LocalStrategy(async function verify(username, password, cb) {

    try {
        const user = await prisma.user.findUnique({
            where: { email: username }
        })

        if (!user) { return cb(null, false, { message: 'Incorrect username.' }); }

        const verify = await verifyPassword(password, user.salt, user.password)

        if (!verify) {
            return cb(null, false, { message: 'Incorrect password.' });
        }
        return cb(null, user);

    } catch (error) {
        return cb(error)
    }
}))



const PORT = process.env.PORT

// seting up express session with prisma session store

app.use(
    session({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000
        },
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(
            prisma,
            {
                checkPeriod: 2 * 60 * 1000,
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined,
            }
        )
    })
);

app.use(passport.authenticate('session'));

// Seting up ejs as my template engine

app.set("views", "./views")

app.set("view engine", "ejs")



app.get("/", (req, res) => {
    return res.render("index", { title: "Home Page Test", header: "Our pages are built through thick and thin." })
})
app.use(express.urlencoded({ extended: false }));
app.get('/login', function (req, res, next) {
    const message = req.session.messages?.at(-1) ?? null;

    // Prevent the old error from appearing repeatedly
    delete req.session.messages;

    res.render("login", { message });
});

app.get('/signup', function (req, res, next) {
    res.render('signup');
});

app.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true
}));

app.post('/signup', async function (req, res, next) {
    try {
        const hashObj = await hashPassword(req.body.password)
        const salt = hashObj.salt.toString("hex");
        const hashedPassword = hashObj.hashedPassword.toString("hex")

        const user = await prisma.user.create({
            data: {
                name: req.body.username.split("@")[0],
                email: req.body.username,
                password: hashedPassword,
                salt: salt,
            },
        });

        const usertemp = {
            id: user.id,
            username: user.email
        };
        req.login(usertemp, function (err) {
            if (err) { return next(err); }
            res.redirect('/');
        });
    } catch (error) {
        next(error)
    }
});

app.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});



passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true
            }
        });

        return cb(null, user ?? false);
    } catch (error) {
        return cb(error);
    }
});





app.listen(PORT, () => {
    console.log("Listening to port: ", PORT)
})