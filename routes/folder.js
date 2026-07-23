import express, { Router } from "express"
import { prisma } from "../lib/prisma.js"
import { mkdir, rename, rm, readdir, stat } from "node:fs/promises";


import path from "node:path";
import { fileURLToPath } from "node:url";

import upload from "../utils/multer.js";


const rootPath = process.cwd() + "/uploads/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//console.log(__dirname);

async function createFolder(destination) {
    try {
        await mkdir(destination, { recursive: true });
        console.log("Folder created");
    } catch (error) {
        console.error("Could not create folder:", error);
    }
}

//createFolder();
const router = Router()


router.use(express.urlencoded({ extended: false }))


router.use((req, res, next) => {
    if (!req.user)
        return res.redirect("/")

    next()

})

router.get("/update/:id", async (req, res, next) => {
    const { id } = req.params

    try {
        const folder = await prisma.folder.findUnique({
            where: { id: parseInt(id) }
        })

        return res.render("updateFolder", { folder })
    } catch (error) {
        next(error)
    }

})

router.post("/update/:id", async (req, res, next) => {
    const { id } = req.params

    try {

        const oldFolder = await prisma.folder.findUnique({
            where: { id: parseInt(id) }
        })

        const oldPath = path.join(rootPath, oldFolder.name);
        const newPath = path.join(rootPath, req.body.name);
        await rename(oldPath, newPath);


        const folder = await prisma.folder.update({
            where: { id: parseInt(id) },
            data: {
                name: req.body.name
            }
        })

        return res.redirect("/folder/")
    } catch (error) {
        next(error)
    }
})

router.get("/", async (req, res, next) => {
    const ownerId = req.user.id

    try {
        const folders = await prisma.folder.findMany({
            where: { ownerId }
        })
        res.locals.folders = folders
        return res.render("folders", { folders })

    } catch (error) {
        next(error)
    }
})

router.get("/files/:id", async (req, res, next) => {
    const { id } = req.params

    try {
        const folder = await prisma.folder.findUnique({
            where: { id: parseInt(id) }
        })

       
        const folderPath = path.join(rootPath, folder.name)

        const entries = await readdir(folderPath, {
            withFileTypes: true
        })

        const fileInformation = await Promise.all(
            entries.map(async (entry) => {
                const fullPath ="/uploads/"+folder.name+"/"+entry.name;
                const information = await stat(folderPath);

                return {
                    name: entry.name,
                    path: fullPath,
                    sizeInBytes: information.size,
                    sizeInKB: (information.size / 1024).toFixed(2),
                    isFile: information.isFile(),
                    isDirectory: information.isDirectory(),
                    createdAt: information.birthtime,
                    modifiedAt: information.mtime,
                };
            })
        );

        return res.render("folderFiles", {folder, files:fileInformation})

    } catch (error) {
        next(error)
    }
})

router.get("/upload/:id", async (req, res, next) => {
    const { id } = req.params

    try {
        const folder = await prisma.folder.findUnique({
            where: { id: parseInt(id) }
        })
        return res.render("folderUpload", { folder })

    } catch (error) {
        next(error)
    }
})

router.post("/upload/:folderName", upload.array('randomFiles', 4), async (req, res, next) => {
    //console.log(req.files[0].filename)
    return res.redirect("/folder/")
})


router.post("/delete/:id", async (req, res, next) => {
    const { id } = req.params
    try {
        const oldFolder = await prisma.folder.findUnique({
            where: { id: parseInt(id) }
        })
        const folderPath = path.join(rootPath, oldFolder.name)
        await rm(folderPath, {
            recursive: true,
            force: true
        })
        const deleteUser = await prisma.folder.delete({
            where: {
                id: parseInt(id),
            },
        });
        return res.redirect("/folder/")
    } catch (error) {
        next(error)
    }

})



router.post("/", async (req, res, next) => {

    const name = req.body.name

    const ownerId = req.user.id

    try {
        await createFolder(path.join(rootPath, name))
        const folder = await prisma.folder.create({
            data: {
                name,
                ownerId
            }
        })

        return res.redirect("/folder/")

    } catch (error) {

    }



})

export default router