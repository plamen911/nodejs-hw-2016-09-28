# Node.js Development - септември 2016

[Node.js Development - Node.js Modules - Files, Utilities, Streams; Deployment](https://youtu.be/JeeewTlvl3o)

### Problem 1. Node.js Utilities Exercises

### Problem 2. Rewrite the server from the last homework
Make it work with real image files. Upload them to the server using streams (you may use any form parser).

### Problem 3. Distribute the files through folders
Decide how to distribute the files so that they are not in the same folder. You may need to separate them into 1000 folders for example.

### Problem 4. Generate random unique URL for the file
If someone opens the URL, the file should be downloaded through the browser. You may add a JSON file used as a database to store the URLs.

### Problem 5. Let the user choose between public and private files
Public files should be shown in the listings and private should be accessible only by the unique URL

### Problem 6. Try to add GZIP on the response
Try to pipe it and provide correct browser headers.

### Problem 7. Deploy the app to the cloud
Keep in mind that Heroku file uploads required third party service. If you want, use some, otherwise the uploaded files may get deleted by their servers (which is fine for this exercise).