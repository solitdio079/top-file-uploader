import passport from "passport"
import LocalStrategy from "passport-local"
import { hashPassword, verifyPassword } from "./password.js"
import {prisma} from "../lib/prisma.js"

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


passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true
            }
        });

        return cb(null, user ?? false);
    } catch (error) {
        return cb(error);
    }
});
