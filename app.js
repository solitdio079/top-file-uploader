import "dotenv/config"
import express from "express"
const app = express()


const PORT = process.env.PORT

// Seting up ejs as my template engine

app.set("views", "./views")

app.set("view engine", "ejs")

app.get("/", (req,res) => {
    return res.render("index", {title: "Home Page Test", header: "Our pages are built through thick and thin."})
})

app.listen(3000, () => {
    console.log("Listening to port: ", PORT)
})