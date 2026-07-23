import "dotenv/config"
import express, {Router} from "express"
import passport from "passport"
import "../utils/passport.js"
const router = Router()

router.use(express.urlencoded({ extended: false }))

router.get('/login',  (req, res, next) => {
    if(req.user)
        return res.redirect("/account")
    const message = req.session.messages?.at(-1) ?? null;

    // Prevent the old error from appearing repeatedly
    delete req.session.messages;

    res.render("login", { message });
});
 



router.get('/signup', function (req, res, next) {
    if(req.user)
        return res.redirect("/account")
    res.render('signup');
});

router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true
}));

router.post('/signup', async function (req, res, next) {
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

router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});






export default router