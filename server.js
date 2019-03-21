const express = require('express');
const app = express();

var mysql = require('mysql');

const bcrypt = require('bcrypt');

const conInfo = 
{
    host: process.env.IP,
    user: process.env.C9_USER,
    password: "",
    database: "SONGDB"
};

// install session module first using 'npm install express-session'
var session = require('express-session'); 
app.use(session({ secret: 'crazy train', 
                  resave: false, 
                  saveUninitialized: false, 
                  cookie: { maxAge: 600000 }}))
                  

app.all('/', whoIsLoggedIn);                  
app.all('/register', register);
app.all('/login', login);
app.all('/logout', logout);
app.all('/listSongs', listSongs);
app.all('/addSong', addSong);
app.all('/removeSong', removeSong);
app.all('/clearSongs', clearSongs);

app.listen(process.env.PORT,  process.env.IP, startHandler())

function startHandler()
{
  console.log('Server listening on port ' + process.env.PORT)
}

function whoIsLoggedIn(req, res)
{
  if(req.session.user == undefined)
    writeResult(res, {'result': 'Nobody is logged in'});
  else
  {
    let result = {'result': {'id': req.session.user['result']['id'], 'email': req.session.user['result']['email']}};
    writeResult(res, result);
  }
  


}


function register(req, res)
{
  
  if (req.query.email == undefined || !validateEmail(req.query.email))
  {
    writeResult(res, {'error' : "Please specify a valid email"});
    return;
  }

  if (req.query.password == undefined || !validatePassword(req.query.password))
  {
    writeResult(res, {'error' : "Password must have a minimum of eight characters, at least one letter and one number"});
    return;
  }

  var con = mysql.createConnection(conInfo);
  con.connect(function(err) 
  {
    if (err) 
      writeResult(res, {'error' : err});
    else
    {
      let hash = bcrypt.hashSync(req.query.password, 12);
      con.query("INSERT INTO USER (USER_EMAIL, USER_PASSWORD) VALUES (?, ?)", [req.query.email, hash], function (err, result, fields) 
      {
        if (err) 
        {
          if (err.code == "ER_DUP_ENTRY")
            err = "User account already exists.";
          writeResult(res, {'error' : err});
        }
        else
        {
          con.query("SELECT * FROM USER WHERE USER_EMAIL = ?", [req.query.email], function (err, result, fields) 
          {
            if (err) 
              writeResult(res, {'error' : err});
            else
            {
              req.session.user = {'result' : {'id': result[0].USER_ID, 'email': result[0].USER_EMAIL}};
              writeResult(res, req.session.user);
            }
          });
        }
      });
    }
  });
}

function login(req, res)
{
  
 if (req.query.email == undefined)
  {
    writeResult(res, {'error' : "Email is required"});
    return;
  }

  if (req.query.password == undefined)
  {
    writeResult(res, {'error' : "Password is required"});
    return;
  }
  
  var con = mysql.createConnection(conInfo);
  con.connect(function(err) 
  {
    if (err) 
      writeResult(res, {'error' : err});
    else
    {
      con.query("SELECT * FROM USER WHERE USER_EMAIL = ?", [req.query.email], function (err, result, fields) 
      {
        if (err) 
          writeResult(res, {'error' : err});
        else
        {
          if(result.length == 1 && bcrypt.compareSync(req.query.password, result[0].USER_PASSWORD))
          {
            req.session.user = {'result' : {'id': result[0].USER_ID, 'email': result[0].USER_EMAIL}};
            writeResult(res, req.session.user);
          }
          else 
          {
            writeResult(res, {'error': "Invalid email/password"});
          }
        }
      });
    }
  });
}

function logout(req, res)
{
  req.session.user = undefined;
  writeResult(res, {'result' : 'Nobody is logged in.'});
  
}

function listSongs(req, res)
{
  console.log("NOW LISTING SONGS");
  if(req.session.user == undefined)
  {
    writeResult(res, {'result': 'Nobody is logged in'});
    return;
  }
  else
  {
  
    var con = mysql.createConnection(conInfo);
    con.connect(function(err) 
    {
      if (err) 
        writeResult(res, {'error' : err});
      else
      {
        con.query("SELECT * FROM SONG WHERE USER_ID = ?", req.session.user.result.id, function (err, result, fields) 
        {
          if (err) 
            writeResult(res, {'error' : err});
          else
          {
            //writeResult(res, {'result': [{'SONG_ID': result[0].SONG_ID, 'USER_ID': result[0].USER_ID, 'SONG_NAME': result[0].SONG_NAME}]});
            writeResult(res, {'result': result});
          }
        });
      }
    });
  }
  
}

function addSong(req, res)
{
  console.log("NOW IN ADD SONGS");
  if(req.session.user == undefined)
  {
    writeResult(res, {'result': 'Nobody is logged in'});
    return;
  }
  else if(req.query.song == undefined)
  {
    writeResult(res, {'error': 'No Song was Defined'});
    return;
  }
  else
  {
  
    var con = mysql.createConnection(conInfo);
    con.connect(function(err) 
    {
      if (err) 
        writeResult(res, {'error' : err});
      else
      {
        con.query("INSERT INTO SONG(SONG_NAME, USER_ID) VALUES (?, ?)", [req.query.song, req.session.user.result.id], function (err, result, fields) 
        {
          if (err) 
            writeResult(res, {'error' : err});
          else
          {
            listSongs(req, res);
          }
        });
      }
    });
  }
  
}

function removeSong(req, res)
{

   console.log("NOW IN REMOVE SONGS");
  if(req.session.user == undefined)
  {
    writeResult(res, {'result': 'Nobody is logged in'});
    return;
  }
  else if(req.query.song == undefined)
  {
    writeResult(res, {'error': 'No Song was Defined'});
    return;
  }
  else
  {
  
    var con = mysql.createConnection(conInfo);
    con.connect(function(err) 
    {
      if (err) 
        writeResult(res, {'error' : err});
      else
      {
        con.query("DELETE FROM SONG WHERE (SONG_NAME, USER_ID) = (?,?)", [req.query.song, req.session.user.result.id], function (err, result, fields) 
        {
          if (err) 
            writeResult(res, {'error' : err});
          else
          {
            listSongs(req, res);
          }
        });
      }
    });
  }
  

}

function clearSongs(req, res)
{
  console.log("NOW CLEARING SONGS");
  if(req.session.user == undefined)
  {
    writeResult(res, {'result': 'Nobody is logged in'});
    return;
  }
  else
  {
  
    var con = mysql.createConnection(conInfo);
    con.connect(function(err) 
    {
      if (err) 
        writeResult(res, {'error' : err});
      else
      {
        con.query("DELETE FROM SONG WHERE USER_ID = ?", req.session.user.result.id, function (err, result, fields) 
        {
          if (err) 
            writeResult(res, {'error' : err});
          else
          {
            writeResult(res, {'result': 'SONG LIST Cleared'});
          }
        });
      }
    });
  }
  
}

function writeResult(res, obj)
{
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(obj));
  res.end('');
}

function validateEmail(email) 
{
  if (email == undefined)
  {
    return false;
  }
  else
  {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
}

function validatePassword(pass)
{
  if (pass == undefined)
  {
    return false;
  }
  else
  {
    var re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(pass);
  }
}

