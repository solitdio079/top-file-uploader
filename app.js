import "dotenv/config"
import express from "express"
import crypto from "crypto"
import { prisma } from "./lib/prisma.js"
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local"
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { hashPassword, verifyPassword } from "./utils/password.js"
import authRouter from "./routes/auth.js"
import multer from "multer";
import folderRouter from "./routes/folder.js"
import path from "path";


import upload from "./utils/multer.js";


const app = express()





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

app.use("/uploads", express.static('uploads'));


app.use("/auth", authRouter)
app.use("/folder", folderRouter)

app.get("/", (req, res) => {
    return res.render("index", { title: "Home Page Test", header: "Our pages are built through thick and thin.", user: req.user || null })
})
app.get("/account", (req, res, next) => {
    if (!req.user)
        return res.redirect("/login")


    //console.log(req.user)
    return res.render("account", { user: req.user })
})




app.post('/profile', upload.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.file.filename)
    return res.redirect("/")
});



app.listen(PORT, () => {
    console.log("Listening to port: ", PORT)
})