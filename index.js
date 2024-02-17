const express = require('express')
const path = require('path');
const axios = require('axios')
const app = express()
const puppeteer = require('puppeteer-extra')
const pluginStealth = require('puppeteer-extra-plugin-stealth') 
const {executablePath} = require('puppeteer'); 
const { v4: uuid } = require('uuid');
const fs = require('fs')


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.set("view engine", "ejs");
app.set('views', __dirname + '/views')
app.set('pdfs', __dirname + '/pdfs')


app.listen(port = '3001', () => {

    console.log(`Listening on port ${port}...\n`)
})




app.get('/', (req, res) => {


   res.render("home.ejs",{developer:'Jack Lee Jabra',license:'Opensource'})

})

app.post('/', (req, res) => {

    const {format,url} = req.body

    // Added HTTPS checking

    const isHttps = url.slice(0,8)

    if (isHttps !== 'https://'){

        httpsurl = 'https://'+url

        console.log(`This is the submitted URL: ${url}\n`)

        console.log(`This is your fixed URL: ${httpsurl}\n`)

        if (format==='screenshot'){

            res.redirect(`/screenshot?url=${httpsurl}`)
    
            
        }else{
    
            res.redirect(`/pdf?url=${httpsurl}`)
    
        }

            

    }else{

        if (format==='screenshot'){

            res.redirect(`/screenshot?url=${url}`)
    
            
        }else{
    
            res.redirect(`/pdf?url=${url}`)
    
        }


    }
    
    
 
 })
 


// app.get('/form', (req, res) => {


//     res.render('form.ejs')

// })


app.get('/pdf', async (req, res) => {




    // USE req.query to post url as query string
    // USE req.body to post the url in the request body from form
    console.log(`RECEIVED REQUEST FOR PDF FILE FROM IP: ${req.ip}\n`)

    console.log('Here is the query object:')
    console.log(req.query)
    console.log('\n')
    
    console.log('Extracting URL from query object...\n')
    const { url } = req.query

    console.log('URL Extracted:')
    console.log(url+'\n')


    if (url){

            // Use stealth 
        puppeteer.use(pluginStealth()) 

        // Creates browser instance 
        const browser = await puppeteer.launch({headless:"new", args: ['--no-sandbox', '--disable-setuid-sandbox'],});

        // Creates page instance
        const page = await browser.newPage();


        page.setDefaultNavigationTimeout(300000)

        // If Link is not valid, it will redirect to the form submission via the catch 
        try {

            // Goes to URL and establishes page
            await page.goto(url, { waitUntil: 'networkidle0' });

            

            await page.emulateMediaType('screen');


            // Generates a unique ID for the PDF 
            const fileId = uuid()
            const fileName = `result-${fileId}.pdf`



            // Prints to PDF and saves under PATH
            const pdf = await page.pdf({
                path: `./pdfs/result-${fileId}.pdf`,
                margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
                printBackground: true,
                format: 'A4',
            });

        
            
            // Closes the browser session

            await browser.close();

            // res.send("HELLO!")
            res.sendFile(path.join(__dirname, `/pdfs/${fileName}`));


            // res.render('result.ejs', { fileId, fileName })   
            

            
            // This uses the Filesystem module to delete the generated file after 10 seconds AFTER sending to the client
            // This prevents the server from being overloaded with thousands of unwanted files
            setTimeout(()=>{

                fs.unlink(path.join(__dirname, `/pdfs/${fileName}`), function (err) {
                    if (err) throw err;
                    console.log(`File deleted!`);
                });

            },10000)


        } catch (e) {

            
            console.log('There Seems To Be An Error: ' + e)
            res.sendFile(path.join(__dirname, `/pdfs/default.pdf`));




        }




    }else{

        res.send("Woah there. Whatchu tryna do wise guy? <a href='/'>Go Back</a>")
    }

    



})


app.get('/screenshot', async (req, res) => {

    
   
    
    // USE req.query to post url as query string
    // USE req.body to post the url in the request body from form
    console.log(`RECEIVED REQUEST FOR IMAGE FILE FROM IP: ${req.ip}\n`)

    console.log('Here is the query object:')
    console.log(req.query)
    console.log('\n')
    
    console.log('Extracting URL from query object...\n')
    const { url } = req.query

    console.log('URL Extracted:')
    console.log(url+'\n')



    if(url){


        

        // Use stealth 
        puppeteer.use(pluginStealth()) 
        
        // Creates browser instance 
        const browser = await puppeteer.launch({headless:"new", args: ['--no-sandbox', '--disable-setuid-sandbox'],});

        // Creates page instance
        const page = await browser.newPage();

        page.setDefaultNavigationTimeout(300000)

        // If Link is not valid, it will redirect to the form submission via the catch 
        try {

            // Goes to URL and establishes page
            await page.goto(url, { waitUntil: 'networkidle0' });


            await page.emulateMediaType('screen');


            // Generates a unique ID for the PDF 
            const fileId = uuid()
            const fileName = `result-${fileId}.png`




            // Takes a Screenshot and saves under PATH
            await page.screenshot({
                "type": "png", // can also be "jpeg" or "webp" (recommended)
                "path": `./screenshots/result-${fileId}.png`,  // where to save it
                "fullPage": true,  // will scroll down to capture everything if true
            });


            
            // Closes the browser session

            await browser.close();

        
            res.sendFile(path.join(__dirname, `/screenshots/${fileName}`));


            // This uses the Filesystem module to delete the generated file after 10 seconds AFTER sending to the client
            // This prevents the server from being overloaded with thousands of unwanted files
            setTimeout(()=>{

                fs.unlink(path.join(__dirname, `/screenshots/${fileName}`), function (err) {
                    if (err) throw err;
                    console.log(`File deleted!`);
                });

            },10000)

            


        }catch(e) {

            console.log('There Seems To Be An Error: ' + e)
            res.sendFile(path.join(__dirname, `/pdfs/default.pdf`));




        }



    }else{

        res.send("Woah there. Whatchu tryna do wise guy? <a href='/'>Go Back</a>")
    }

    




})


app.get('*',(req,res)=>{

    res.send("Woah there. Whatchu tryna do wise guy? <a href='/'>Go Back</a>")
    
})








































































































// Developer: Jack Lee Jabra
// License: OpenSource