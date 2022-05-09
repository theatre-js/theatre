const {PutObjectCommand, S3Client} = require('@aws-sdk/client-s3')
const fs = require('fs')
const path = require('path')

const TARBALL_PATH = process.env.DO_TARBALL_PATH
const BUCKET = process.env.DO_BUCKET
const REGION = process.env.DO_REGION
const API_KEY = process.env.DO_API_KEY
const SECRET = process.env.DO_SECRET
const FOLDER = process.env.FOLDER
// TODO: change the package naming to this:
// `@theatre/core@0.4.8-insiders.HASH`
// https://theatrejs-packages.nyc3.cdn.digitaloceanspaces.com/theatre-browser-bundles-3c6b62cc.tgz
const DOMAIN =
  process.env.DO_DOMAIN || `${BUCKET}.${REGION}.cdn.digitaloceanspaces.com`

const s3Client = new S3Client({
  endpoint: `https://${REGION}.digitaloceanspaces.com`, // Find your endpoint in the control panel, under Settings. Prepend "https://".
  region: REGION, // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
  credentials: {
    accessKeyId: API_KEY, // Access key pair. You can create access key pairs using the control panel or API.
    secretAccessKey: SECRET, // Secret access key defined through an environment variable.
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
  Bucket: `${BUCKET}`, // The path to the directory you want to upload the object to, starting with your Space name.
  Key: `${FOLDER}/${path.basename(TARBALL_PATH)}`, // Object key, referenced whenever you want to access this file later.
  // Body: "Hello, World!", // The object's contents. This variable is an object, not a string.
  ACL: 'public-read', // Defines ACL permissions, such as private or public.
  Body: fileStream,
}

const uploadObject = async () => {
  const data = await s3Client.send(new PutObjectCommand(s3Params))
  console.log(
    'Successfully uploaded object: ' + s3Params.Bucket + '/' + s3Params.Key,
    `url: \x1b[33m\nhttps://${DOMAIN}/${s3Params.Key}\n\x1b[0m`,
  )
  return data
}

uploadObject()
