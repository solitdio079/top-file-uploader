import multer from "multer"
import path from "path"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const rootPath = process.cwd() + "/uploads"
        const {folderName} = req.params
        cb(null, folderName ? path.join(rootPath,folderName) : path.join(rootPath, "uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = file.originalname.split(".").at(-1)
        cb(null, file.originalname + '-' + uniqueSuffix + '.' + extension);
    },
});

const upload = multer({ storage: storage });


export default upload