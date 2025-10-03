const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Lesson, Quiz, Task, Submission } = require("./models");

const router = express.Router();
const JWT_SECRET = "supersecret";

// Middleware for protected routes
const authMiddleware = (req,res,next)=>{
  const token = req.headers["authorization"];
  if(!token) return res.status(401).json({error:"No token"});
  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  }catch(err){
    return res.status(401).json({error:"Invalid token"});
  }
};

// ----- AUTH -----
router.post("/auth/register", async(req,res)=>{
  const { name,email,password,role,school } = req.body;
  const hashedPassword = await bcrypt.hash(password,10);
  try{
    const user = new User({ name,email,password:hashedPassword,role,school });
    await user.save();
    res.json({ message:"User registered" });
  }catch(err){ res.status(400).json({ error:"User exists" }); }
});

router.post("/auth/login", async(req,res)=>{
  const { email,password } = req.body;
  const user = await User.findOne({email});
  if(!user) return res.status(400).json({error:"Invalid email"});
  const match = await bcrypt.compare(password,user.password);
  if(!match) return res.status(400).json({error:"Invalid password"});
  const token = jwt.sign({id:user._id,role:user.role},JWT_SECRET,{expiresIn:"1d"});
  res.json({ token,user });
});

// ----- USERS -----
router.get("/users/:id", authMiddleware, async(req,res)=>{
  const user = await User.findById(req.params.id);
  res.json(user);
});

// ----- LESSONS -----
router.post("/lessons", authMiddleware, async(req,res)=>{
  const { title, content, category } = req.body;
  const lesson = new Lesson({ title,content,category,createdBy:req.user.id });
  await lesson.save();
  res.json(lesson);
});
router.get("/lessons", async(req,res)=>{
  const lessons = await Lesson.find();
  res.json(lessons);
});

// ----- QUIZZES -----
router.post("/quizzes", authMiddleware, async(req,res)=>{
  const quiz = new Quiz(req.body);
  await quiz.save();
  res.json(quiz);
});
router.get("/quizzes/:lessonId", async(req,res)=>{
  const quizzes = await Quiz.find({lessonId:req.params.lessonId});
  res.json(quizzes);
});
router.post("/quizzes/:quizId/submit", authMiddleware, async(req,res)=>{
  const quiz = await Quiz.findById(req.params.quizId);
  const answers = req.body.answers; // array of indices
  let score=0;
  quiz.questions.forEach((q,i)=>{ if(q.answer === answers[i]) score++; });
  // update ecoPoints
  await User.findByIdAndUpdate(req.user.id,{$inc:{ecoPoints:score*10}});
  res.json({ score, pointsEarned: score*10 });
});

// ----- ECO TASKS -----
router.post("/tasks", authMiddleware, async(req,res)=>{
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});
router.get("/tasks", async(req,res)=>{
  const tasks = await Task.find();
  res.json(tasks);
});
router.post("/tasks/:taskId/submit", authMiddleware, async(req,res)=>{
  const { proof } = req.body;
  const submission = new Submission({ userId:req.user.id, taskId:req.params.taskId, proof });
  await submission.save();
  res.json({ message:"Submission created, pending approval" });
});

// ----- LEADERBOARD -----
router.get("/leaderboard", async(req,res)=>{
  const top = await User.find().sort({ecoPoints:-1}).limit(10);
  res.json(top);
});

// ----- REWARDS -----
router.get("/rewards/:userId", async(req,res)=>{
  const user = await User.findById(req.params.userId);
  res.json({ ecoPoints:user.ecoPoints, badges:user.badges });
});

module.exports = router;
