const multer = require('multer');
const path = require('path');

// Configure storage location and file naming rules
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = path.extname(file.originalname).toLowerCase();
        
        let prefix = 'doc';
        if (file.fieldname === 'avatar') {
            prefix = 'avatar';
        } else if (file.fieldname === 'resume') {
            prefix = 'resume';
        }
        
        cb(null, prefix + '-' + uniqueSuffix + fileExt);
    }
});

// Configure file filters to restrict extensions based on fieldname
const fileFilter = (req, file, cb) => {
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (file.fieldname === 'avatar') {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid image file type. Only JPEG, PNG, JPG, GIF, and WEBP formats are allowed.'), false);
        }
    } else if (file.fieldname === 'resume') {
        const allowedDocExtensions = ['.pdf', '.doc', '.docx'];
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedDocExtensions.includes(fileExt) || allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid resume file type. Only PDF, DOC, and DOCX document formats are allowed.'), false);
        }
    } else {
        cb(null, true);
    }
};

// Create multer configurations
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit max
    }
});

module.exports = upload;
