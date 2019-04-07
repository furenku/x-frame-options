const express = require('express');
const axios = require('axios');
const mime = require('mime');
const morgan = require('morgan');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('tiny'));

const regex = /\s+(href|src)=['"](.*?)['"]/g;

const getMimeType = url => {
    if(url.indexOf('?') !== -1) { // remove url query so we can have a clean extension
        url = url.split("?")[0];
    }
    if(mime.getType(url) === 'application/x-msdownload') return 'text/html';
    return mime.getType(url) || 'text/html'; // if there is no extension return as html
};

app.get('/', (req, res) => {
    const { url } = req.query; // get url parameter

//console.log( url );

    if(!url) {
        res.type('text/html');
        return res.end("You need to specify <code>url</code> query parameter");
    }

    axios.get(url, { responseType: 'arraybuffer'  }) // set response type array buffer to access raw data
        .then(({ data }) => {

            console.log(data);
            

            const urlMime = getMimeType(url); // get mime type of the requested url
            if(urlMime === 'text/html') { // replace links only in html
                // data = data.toString().replace(regex, (match, p1, p2)=>{
                //     let newUrl = '';
                //     if(p2.indexOf('http') !== -1) {
                //         newUrl = p2;
                //     } else if (p2.substr(0,2) === '//') {
                //         newUrl = 'http:' + p2;
                //     } else {
                //         const searchURL = new URL(url);
                //         newUrl = searchURL.protocol + '//' + searchURL.host + p2;
                //     }
                //     return ` ${p1}="${req.protocol}://${req.hostname}?url=${newUrl}"`;
                // });
            }
            res.type(urlMime);
            res.send(data);
        }).catch(error => {
        	
		console.log("error");

		res.type('text/html');
            return res.end(`
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>

    <style>


        @font-face {
            font-family: 'Suisse';
            font-style: normal;
            font-weight: normal;
            src: url('http://192.241.194.153:8080/fonts/SuisseIntl-Regular.otf');
        }

        @font-face {
            font-family: 'Suisse';
            font-style: bold;
            font-weight: 800;
            src: url('http://192.241.194.153:8080/fonts/SuisseIntl-Medium.otf');
        }



        html, body {
            font-family: 'Suisse', sans-serif;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align:center;
        }

        a {
            color: black;
        }

        * {
            font-family: 'Suisse', sans-serif;
        }


    </style>
</head>
<body>
    
    <section class="ErrorNotice">
        <h1>
            Error 404.    
        </h1>
        
        <p>
            ¡Lo sentimos!
        </p>
        <p>
            Hay un problema con el enlace seleccionado:
        </p>

        <a href="#">${url}</a>

    </section>
</body>
</html>
`);

    	});
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
