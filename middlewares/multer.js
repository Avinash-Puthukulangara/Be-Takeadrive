import multer, { diskStorage } from "multer";
import path from "path";

const storage = diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname);  
    },
});


const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|webp|svg|bmp|tiff|heic/; 
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true); 
    } else {
        cb(new Error('Only images are allowed!'), false); 
    }
};

export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

export const uploadMultiple = upload.fields([
    { name: 'userpic', maxCount: 1 },
    { name: 'lcfrontpic', maxCount: 1 },
    { name: 'lcbackpic', maxCount: 1 },
    { name: 'dealerpic', maxCount: 1 },
    { name: 'carpic', maxCount: 3}
]);
