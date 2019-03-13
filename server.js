const express = require('express');
const app = express();

// install session module first using 'npm install express-session'
var session = require('express-session'); 
app.use(session({ secret: 'crazy train', 
                  resave: false, 
                  saveUninitialized: false, 
                  cookie: { maxAge: 60000 }}))

app.get('/', printSong);                  
app.get('/sort', sortSong);
app.get('/add', addSong);
app.get('/remove', remSong);
app.get('/clear', clearSong);
app.listen(process.env.PORT,  process.env.IP, startHandler())

var songs = [];

function startHandler()
{
  console.log('Server listening on port ' + process.env.PORT)
}

function printSong(req, res)
{
  let result = {};
  
  try
  {
    result = {'Songs': songs};
  }
  catch(e)
  {
    result = {'error': e.message}
  }
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(result));
  res.end('');
}

function sortSong(req, res)
{
  let result = {};
  try
  {
    result = {'songs':songs.sort()};
  }
  catch (e)
  {
    result = {'error' : e.message};
  }
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(result));
  res.end('');
}

function addSong(req, res)
{
  let result = {};
  
  try
  {
   
    
    if(req.session.index == undefined)
      req.session.index = 0;
    
    if(req.query.song == undefined)
    {
      result = {'error': 'no/too many songs added'};
    }
    else
    {
       req.session.song = req.query.song;
       songs[req.session.index] = req.session.song;
       req.session.index++;
       result = {'Songs': songs};
    }
  }
  catch(e)
  {
    result = {'error': e.message};
  }
  
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(result));
  res.end('');
  
}

function remSong(req, res)
{
  let result = {};
  
  try
  {
    if(req.query.song == undefined || req.query.song > 2)
      result = {'error': 'no/too many songs defined'};
    else
    {
      
      let index = songs.indexOf(req.query.song);
      
      if(index != -1)
      {
       songs.splice(index, 1);
       req.session.songs = songs;
       req.session.index--;
       result = {'Songs':songs};
      }
      
    }
  }
  catch(e)
  {
    result = {'error': e.message};
  }
  
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(result));
  res.end('');
  
}

function clearSong(req, res)
{
  let result = {};
  
  try
  {
    delete req.session.songs;
    req.session.index = 0;
    songs = [];
    result = {'Songs': songs};
  }
  catch(e)
  {
    result = {'error': e.message};
  }
  
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(result));
  res.end('');
}

