const express =require('express')
const app=express()

app.listen(5000,()=>{
  console.log("Server Started on port no 5000");
})


var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'demoapitesing@gmail.com',
    pass: 'xyz'
  }
});




const session=require('express-session')
app.use(session({'secret':'abc123'}))

app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


const path=require('path')
app.set('views',path.join(__dirname,'views'))
app.set('view engine','hbs')

app.use(express.static(path.join(__dirname, 'views')))

var bodyparser=require('body-parser')
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
  extended:true
}))


app.get('/addemp',(request,response)=>{
  response.render('newemp');
})


const con=require('./DBConnection')
const mysql=require('mysql')

app.post('/InsertEmp',(request,response)=>{
  var empid=request.body.eid;
  var empname=request.body.ename;
    var empsalary=request.body.salary;
var sql='insert into employee(eid,ename,salary)values(?,?,?)';
var data=[empid,empname,empsalary]
var sql=mysql.format(sql,data);
con.query(sql,(err)=>{
if(err) throw err;
else
response.render('index',{'msg':'Data Inserted Successfully'});
})

})

app.get('/',(request,response)=>{
  response.render('index');
})
app.get('/register',(request,response)=>{
  response.render('newemp');
})



app.post('/logincheck',(request,response)=>{
var loginid=request.body.loginid;
var password=request.body.password;
var sql="select * from login where userid=? and password=?";
var data=[loginid,password]
var sql=mysql.format(sql,data);
con.query(sql,(err,result)=>{
  if(err) throw err;
  else
  {
    if(result.length>0)
  {
    request.session.user=loginid
response.render('Home',{'user':request.session.user});
}else
response.render('index',{'msg':'Login Fail, try again'})
  }
})
})

app.get('/showemps',(request,response)=>{
if(request.session.user===undefined)
response.render('index')

var sql="select * from employee";
con.query(sql,(err,result)=>{
  if(err) throw err;
  else
  response.render('viewemps',{'emps':result,'user':request.session.user})
})
})

app.get('/logout',(request,response)=>{
request.session.destroy();
response.render('index',{'msg':'Logged out Successfully'})

})

app.get('/fpassword',(request,response)=>{
    response.render('forgetpwd')
})






app.post('/getPassword',(request,response)=>{
var emailid=request.body.emailid
var sql="select password from login where userid=?"
var data=[emailid]
sql=mysql.format(sql,data)
con.query(sql,(err,result)=>{
if(err) throw err;
else
{
  console.log(result[0].password);

  var mailOptions = {
    from: 'demoapitesing@gmail.com',
    to: emailid,
    subject: 'EMS Password Recovery',
    text: 'Hello '+emailid+',your password is'+ result[0].password
              };
  transporter.sendMail(mailOptions, (err,result)=>{
    if (err) throw err;
     else
      response.render('forgetpwd',{'msg':'Your password is sent on yout emailid'});
  });


}
});



})

app.get('/fileuploadform',(request,response)=>{
  response.render('fileupload');
})

const upload=require('express-fileupload')
app.use(upload())

app.post('/UploadAction',(request,response)=>{
console.log(request.files);
if(request.files){

var pname=request.body.productname;
var  file=request.files.file;
var filename=file.name;
console.log(pname);
console.log(filename);
file.mv('./upload/'+filename,(err)=>{
  if(err) throw err;
  else {
    var sql="insert into  products(pname,image) values(?,?)";
    var data=[pname,filename]
    sql=mysql.format(sql,data);
    con.query(sql,(err)=>{
      if(err) throw err;
      else
        response.render('fileupload',{'msg':'Data saved and file uploaded...'})
    })

  }

})

}

})



















app.use(function(req, res) {
 res.status(404);
res.render('404', {title: '404: Requested Page Not Found'});
});
