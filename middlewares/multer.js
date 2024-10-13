import multer, { diskStorage } from "multer";
import path from "path";

// Configure storage
const storage = diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname);  
    },
});

// File filter for allowed image types
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|webp|svg|bmp|tiff|heic/; // Removed duplicate webp
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true); 
    } else {
        // Return error if the file type is not allowed
        cb(new Error('Only images are allowed!'), false); 
    }
};

// Initialize multer with storage and file filter
export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

// Middleware for uploading multiple files
export const uploadMultiple = upload.fields([
    { name: 'userpic', maxCount: 1 },
    { name: 'lcfrontpic', maxCount: 1 },
    { name: 'lcbackpic', maxCount: 1 },
    { name: 'dealerpic', maxCount: 1 },
    { name: 'carpic', maxCount: 3}
]);
