const mysql=require('mysql')
var con=mysql.createConnection({
'host':'localhost',
'database':'employeedb',
'user':'root',
'password':'root',
'port':'3307'
})

module.exports=con;

// con.connect((err)=>{
//   if(err) throw err;
//   else
//   console.log("DB Connected");
// })
