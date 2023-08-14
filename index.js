const request = require('request');

const envMode = process.env.mode || "once";
const envHeaders = process.env.headers||"";
const envUrl = process.env.url;
const envMethod = process.env.method||"GET";
const envBody = process.env.body||"";
const hearthBeatUrl = process.env.hearthBeatUrl||null;

if(envUrl==null) throw new Error('url required!');

function parseEnvObject(env){
    let newObject = {};
    if(env.includes(',')){
        let splitString = env.split(',');
        for (const item of splitString) {
            if(item.includes(':')){
                let [key, value] = item.split(':');
                newObject[key.trim()] = value.trim();
            }
        }
    }else{
        if(env.includes(':')){
            let [key, value] = env.split(':');
            newObject[key.trim()] = value.trim();
        }
    }
    return newObject;
}

var counter = 1;

function handleProcess(){
    console.log("starting requires", counter);
    counter++;
    /* Only Once */
    if(envMethod=='GET'){
        request.get(envUrl, {maxRedirects:0, headers:parseEnvObject(envHeaders)}, (error, response, body)=>{
            if(error){
                console.log(error);
                process.exit(1);
            }else{
                console.log(response.statusCode);
                console.log(body);
                if(response.statusCode==200){
                    sendHearthBeat();
                }else{
                    if(envMode=="poll"){
                        console.log("retry in 5000ms")
                        setTimeout(()=>{
                            handleProcess();
                        }, 5000)
                    }
                }
                
            }
        })
    }else{
        request.post(envUrl, {maxRedirects:0, headers:parseEnvObject(envHeaders), body:JSON.stringify(parseEnvObject(env))}, (error, response, body)=>{
            if(error){
                console.log(error);
                process.exit(1);
            }else{
                console.log(response.statusCode);
                console.log(body);
                if(response.statusCode==200){
                    sendHearthBeat();
                }else{
                    if(envMode=="poll"){
                        console.log("retry in 5000ms")
                        setTimeout(()=>{
                            handleProcess();
                        }, 5000)
                    }
                }
            }
        });
    }
}

handleProcess();




function sendHearthBeat(){
    if(hearthBeatUrl==null) return;
    request.get(hearthBeatUrl, {}, (error, response, body)=>{
        if(error){
            console.log(error);
            process.exit(1);
        }else{
            console.log(response.statusCode);
            console.log(body);
            if(response.statusCode!=200){
                throw new Error(`hearthbeat statusCode ${response.statusCode}`)
            }
        }
        if(envMode=="poll"){
            console.log("waiting for next cycle in 5000ms")
            setTimeout(()=>{
                handleProcess();
            }, 5000)
        }
    })
}