import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import shortid from 'shortid';
import {
  AWS_ACCESS_KEY_ID,
  AWS_ACCESS_KEY_SECRET,
  IS_PRODUCTION
} from '../config';

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_ACCESS_KEY_SECRET
});

const S3_BUCKET = IS_PRODUCTION
  ? 'callpepper-production'
  : 'callpepper-staging';

const S3_VOICEMAIL_KEY_FOLDER = 'voicemail';

const S3_USER_VOICEMAIL_RECORDING_KEY_FOLDER = 'user-custom-voicemail-greeting';

const uploadUtilUser = (folderName: string) =>
  multer({
    storage: multerS3({
      s3,
      bucket: S3_BUCKET,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key(req, file, cb) {
        cb(null, `${folderName}/${shortid.generate()}${file.originalname}`);
      }
    })
  });

export {
  s3,
  S3_BUCKET,
  S3_VOICEMAIL_KEY_FOLDER,
  uploadUtilUser,
  S3_USER_VOICEMAIL_RECORDING_KEY_FOLDER
};
