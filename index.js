const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
const bcypt = require('bcrypt')

const app= express();

//install mongoose 
//script to connect mongodb to our node js
mongoose.connect("mongodb://127.0.0.1:27017",{
   dbName:'backend',
}).then(()=>console.log('database connected'))
.catch((e)=> console.log(e));

//schema for storing our data
//phle se bata rhe hai ki kya kya hai 
//aur kis type ka data hai
const userSchema = new mongoose.Schema({
   name:String,
   email:String,
   password:String
});

const User = mongoose.model("User",userSchema);


//using middlewares
app.use(express.static(path.join(path.resolve(),'public')));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
// console.log((path.join(path.resolve(),'public')));

//static data render karane ke liye
//path  join se path join ho jate hai
//resolve se current path milta hai
//public likha hai taaki current path me join ho jaye

//setting up view engine
//ya to engine set kro ya to re.render me file ka extension do
app.set('view engine','ejs')

app.listen(5000,()=>{
   console.log("server is working");
});

//yeh ek middleware hai jo ki check 
//krega ki token available hai ki nahi
//agar token hai to next() mtlb age ka cheze render hogi
//nhi to login page ayega
const isAuthenticated  = async(req,res,next)=>{
   const {token} = req.cookies;
   // console.log(req.cookies);

   if(token){

     const decoded =  jwt.verify(token,'qwertyuiopasdfgh')

     req.user = await User.findById(decoded._id);

      next();
   }
   else{
      res.redirect('/login');
   }
}



//isAuthenticated ek handler hai token hoga to logut render hoga nhi to login 
app.get('/', isAuthenticated, (req,res) =>{ 
   console.log(req.user);
   res.render('logout',{name: req.user.name});
})

// app.post('/login',(req,res)=>{
//    res.cookie('token',' i am in',{
//       httpOnly:true,
//       expires: new Date(Date.now()+60*1000)
//    });
//    res.redirect('/');
  
// })

app.get('/logout',(req,res)=>{
   res.cookie('token',null,{
      httpOnly:true,
      expires: new Date(Date.now())
   });
   res.redirect('/'); 
})

app.get('/register',(req,res)=>{
   res.render('register');
})

app.get('/login',(req,res)=>{
   res.render('login');
})

app.post('/register' ,async (req,res)=>{

   const {name,email,password} = req.body;

   let user = await User.findOne({email});
   
   if(user){
      return res.redirect('/login');
   }

   //encrypting the password
   const hashPassword = await bcypt.hash(password,10);

   user =  await User.create({
      name,email,password : hashPassword,
});
  
   const token = jwt.sign({_id:user._id}, 'qwertyuiopasdfgh');

   res.cookie('token', token,{
      httpOnly:true,
      expires: new Date(Date.now() + 60*1000),
   });

   res.redirect('/');
});


app.post('/login',async(req,res)=>{

   const {email,password} = req.body;

   let user = await User.findOne({email});

   if(!user) return res.redirect('register');

   const isMatch = await bcypt.compare(password,user.password);

   if(!isMatch) return res.render('login',{message : "Incorrect Password"})

   const token = jwt.sign({_id:user._id}, 'qwertyuiopasdfgh');

   res.cookie('token', token,{
      httpOnly:true,
      expires: new Date(Date.now() + 60*1000),
   });

   res.redirect('/');
})
//ye route hai
//  

//data send kr rhe hai to api kahenge
// app.get('/users',(req,res)=>{
//    res.json({
//       userInfo,
//    });
// });

// app.post('/contact',async(req,res)=>{
//    // res.end();

//    const{ name, email } = req.body;
//    const messageData = {name, email};
//    console.log(messageData);
//    await message.create(messageData);
//    //rendering page after fetching user info
//    res.redirect('/success');
// })



// app.get('/add',(req,res)=>{

//     message.create({name:"Saurabh",email:"sample@gmail.com"})
//       .then(()=>{
//       res.send ('Sent to dataBase');
//     })
// });

//api banali hai
// app.get('/',(req,res)=>{
//    res.json({
//       success: true,
//       products:[],
//    })
// })

//ejs ka use krke dynamic render kara skte hai jo ki 
//sirf html se sambhav nahi hai isliye ejs ka use krte hai

// app.get('/',(req,res)=>{
//    res.render('index',{name: "SAURABh"});
//    // res.sendFile('ind ex.html');
// });