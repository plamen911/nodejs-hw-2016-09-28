//Dependencies
let fs = require('fs');
let path = require('path');
let uid = require('uid2');
let mime = require('mime');
let jsonfile = require('jsonfile');
let url = require('url');
let zlib = require('zlib');

//Constants
let IMAGE_DIR_PUBLIC = __dirname + '/../public/images/';
let IMAGE_DIR_PRIVATE = __dirname + '/../private/images/';
let IMAGE_TYPES = ['image/jpeg', 'image/png'];
let PAGE_TITLE = 'Node.js Modules - Files, Utilities, Streams; Deployment - Homework';
let DATA_FILE = __dirname + '/../data.json';

//let imagesJson = require('../movies.json');
let filesJson = {
    public: [],
    private: []
};

// Homepage
exports.home = (req, res, next) => {
    jsonfile.readFile(DATA_FILE, (err, obj) => {
        if (err) {
            jsonfile.writeFileSync(DATA_FILE, filesJson, {spaces: 2});
        } else {
            filesJson = obj;
        }

        let publicFiles = filesJson.public;
        let privateFiles = filesJson.private;

        if (privateFiles.length) {
            for (let i = 0; i < privateFiles.length; i++) {
                privateFiles[i].filePath = privateFiles[i].filePath.replace('/', '-');
            }
        }

        let data = {
            title: PAGE_TITLE,
            currentUrl: req.getUrl(),
            publicFiles: publicFiles,
            privateFiles: privateFiles
        };

        res.render('home', data, (err, output) => {
            if (err) {
                return res.status(500).send(`Error rendering output: ${err.message}`);
            }
            // Add GZIP on the response
            res.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip'});

            let buf = new Buffer(output, 'utf-8');
            zlib.gzip(buf, (_, result) => {
                res.end(result);
            });
        });
    });
};

exports.upload = (req, res, next) => {
    let writeStream;
    let isPublic = false;

    let fileData = {
        fileName: '',
        mimeType: '',
        filePath: ''
    };

    req.pipe(req.busboy);

    req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        let targetPath;
        let targetDir;
        let targetName;
        //get the extenstion of the file
        let extension = filename.split(/[. ]+/).pop();

        //check to see if we support the file type
        if (IMAGE_TYPES.indexOf(mimetype) == -1) {
            return res.status(500).send(`Supported image formats: jpeg, jpg, jpe, png.`);
        }

        //create a new name for the image
        targetName = uid(22) + '.' + extension;
        targetDir = Math.round(new Date().getTime() / 1000).toString();

        // Distribute the files through folders
        try {
            fs.mkdirSync(IMAGE_DIR_PUBLIC + targetDir);
        } catch (err) {
            return res.status(500).send(`Error creating dir: ${err.message}`);
        }

        //determine the new path to save the image
        targetPath = path.join(IMAGE_DIR_PUBLIC + targetDir + '/', targetName);

        fileData = {
            fileName: filename,
            mimeType: mimetype,
            //filePath: targetPath.split(/(uploads\/.+)/)[1]
            filePath: targetDir + '/' + targetName
        };

        writeStream = fs.createWriteStream(targetPath);
        file.pipe(writeStream);
        writeStream.on('close', () => {
            //res.redirect('back');
        });
    });

    req.busboy.on('field', (key, value, keyTruncated, valueTruncated) => {
        if (key == 'is_public') {
            isPublic = true;
        }
    });

    req.busboy.on('finish', () => {

        (isPublic) ? filesJson.public.push(fileData) : filesJson.private.push(fileData);

        // Store the URLs in JSON file used as a database
        jsonfile.writeFile(DATA_FILE, filesJson, {spaces: 2}, (err) => {
            if (err) {
                return res.status(500).send(`Error creating dir: ${err.message}`);
            }

            if (!isPublic) {
                let srcImage = IMAGE_DIR_PUBLIC + fileData.filePath;
                let destDir = fileData.filePath.toString().split('/')[0];
                try {
                    fs.mkdirSync(IMAGE_DIR_PRIVATE + destDir);
                } catch (err) {
                    return res.status(500).send(`Error creating dir: ${err.message}`);
                }

                let destImage = IMAGE_DIR_PRIVATE +fileData.filePath;

                // move image to private dir.
                let readStream = fs.createReadStream(srcImage);
                let writeStream = fs.createWriteStream(destImage);

                readStream
                    .pipe(writeStream)
                    .on('finish', () => {
                        // delete public image and its public directory
                        fs.unlinkSync(srcImage);
                        fs.rmdirSync(IMAGE_DIR_PUBLIC + destDir);
                    });
            }

            res.redirect('back');
        })
    });
};

// Viewing episodes
exports.download = (req, res, next) => {
    let image = req.params.image || '';
    let file;
    let regex = /(\d+)\-([A-Za-z0-9]+\.[A-Za-z]{3,4})/g;
    let m;
    if ((m = regex.exec(image)) !== null) {
        file = IMAGE_DIR_PRIVATE + m[1] + '/' + m[2];
    }

    if (!file) {
        return res.status(500).send(`Invalid image name!`);
    }

    let filename = path.basename(file);
    let mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    let gzip = zlib.createGzip();
    let readStream = fs.createReadStream(file);

    readStream
        .pipe(res);
};

// Not found
exports.not_found = (req, res) => {
    res.render('not_found', {
        title: 'This is not the page you were looking for.'
    });
};
