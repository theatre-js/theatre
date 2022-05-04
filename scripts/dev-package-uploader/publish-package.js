const {PutObjectCommand, S3Client} = require('@aws-sdk/client-s3')
const fs = require('fs')
const path = require('path')

const TARBALL_PATH = process.env.TARBALL_PATH

const s3Client = new S3Client({
  endpoint: 'https://fra1.digitaloceanspaces.com', // Find your endpoint in the control panel, under Settings. Prepend "https://".
  region: 'fra1', // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
  credentials: {
    accessKeyId: process.env.API_KEY, // Access key pair. You can create access key pairs using the control panel or API.
    secretAccessKey: process.env.SECRET, // Secret access key defined through an environment variable.
  },
})

// Check if the tarball exists
try {
  fs.accessSync(TARBALL_PATH)
} catch (error) {
  if (error.code === 'ENOENT') {
    throw new Error(`\x1b[31mFile does not exist: ${TARBALL_PATH}\x1b[0m`)
  } else {
    throw error
  }
}

const fileStream = fs.readFileSync(TARBALL_PATH)

const s3Params = {
  Bucket: process.env.BUCKET, // The path to the directory you want to upload the object to, starting with your Space name.
  Key: path.basename(TARBALL_PATH), // Object key, referenced whenever you want to access this file later.
  // Body: "Hello, World!", // The object's contents. This variable is an object, not a string.
  ACL: 'public-read', // Defines ACL permissions, such as private or public.
  Body: fileStream,
}

const uploadObject = async () => {
  const data = await s3Client.send(new PutObjectCommand(s3Params))
  console.log(
    'Successfully uploaded object: ' + s3Params.Bucket + '/' + s3Params.Key,
    `url: \x1b[33m\nhttps://packages.fulop.dev/${s3Params.Key}\n\x1b[0m`,
  )
  return data
}

uploadObject()
