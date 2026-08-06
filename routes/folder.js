import express, { Router } from "express"
import { prisma } from "../lib/prisma.js"
import { mkdir, rename, rm, readdir, stat } from "node:fs/promises";


import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

import upload, { memUpload } from "../utils/multer.js";
import supabase from "../utils/supaClient.js";


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
            where: { ownerId },
            include: { files: true }
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

        const entries = await prisma.file.findMany({
            where: {
                folderName: folder.name
            }
        })

        const fileInformation = await Promise.all(
            entries.map(async (entry) => {
                //const fullPath ="/uploads/"+folder.name+"/"+entry.name;
                //const information = await stat(folderPath);
                return {
                    name: entry.originalName,
                    path: entry.storagePath,
                    folderName: entry.folderName,
                    storageName: entry.storageName,
                    sizeInBytes: entry.size,
                    sizeInKB: (entry.size / 1024).toFixed(2),
                    createdAt: entry.createdAt,
                };
            })
        );

        return res.render("folderFiles", { folder, files: fileInformation })

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

router.post("/upload/:folderName", memUpload.single('randomFile'), async (req, res, next) => {
    //console.log(req.files[0].filename)

    try {
        const BUCKET_NAME = 'top_upload'
        const { folderName } = req.params
        if (!req.file) {
            return res.status(400).json({
                message: 'No file was provided'
            })
        }

        const extension = path.extname(req.file.originalname)
        const storageName = `${randomUUID()}${extension}`;
        const storagePath = `${folderName}/${storageName}`

        const { data: uploadedFile, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, req.file.buffer, {
            contentType: req.file.mimetype,
            cacheControl: '3600',
            upsert: false
        })

        if (uploadError) {
            return res.status(500).json({
                message: 'Supabase upload failed',
                error: error.message
            })
        }

        try {
            await prisma.file.create({
                data: {
                    originalName: req.file.originalname,
                    storageName,
                    storagePath: uploadedFile.path,
                    bucket: BUCKET_NAME,
                    mimeType: req.file.mimetype,
                    size: req.file.size,
                    folderName
                }
            })

            return res.redirect("/folder/")

        } catch (databaseError) {
            await supabase.storage.from(BUCKET_NAME).remove([uploadedFile.path])

            throw databaseError
        }


    } catch (error) {
        next(error)
    }

})


router.post("/delete/:id", async (req, res, next) => {
    const { id } = req.params
    try {
        const oldFolder = await prisma.folder.findUnique({
            where: { id: parseInt(id) }
        })
        const folderFiles = await prisma.file.findMany({
            where: {
                folderName: oldFolder.name
            }
        })

        const batch = folderFiles.map(file => `${oldFolder.name}/${file.storageName}`)

        const folderPath = path.join(rootPath, oldFolder.name)
       
        if (batch.length > 0) {
            await supabase.storage
                .from('top_upload')
                .remove(batch);
        }

        await prisma.file.deleteMany({
            where: {
                folderName: oldFolder.name
            }
        })
        await prisma.folder.delete({
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
        // await createFolder(path.join(rootPath, name))
        const folder = await prisma.folder.create({
            data: {
                name,
                ownerId
            }
        })

        return res.redirect("/folder/")

    } catch (error) {
        next(error)
    }
})

export default router