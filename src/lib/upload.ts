import multer from 'multer';
import multerS3 from 'multer-s3';
import s3Client from './s3';

export const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, 'uploads/' + Date.now().toString() + '-' + file.originalname);
    }
  })
});