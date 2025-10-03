const mongoose = require("mongoose");

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student","teacher","admin"], default:"student" },
  ecoPoints: { type: Number, default: 0 },
  badges: [String],
  school: String
},{ timestamps: true });

// Lesson Schema
const LessonSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  createdBy: mongoose.Schema.Types.ObjectId
},{ timestamps: true });

// Quiz Schema
const QuizSchema = new mongoose.Schema({
  lessonId: mongoose.Schema.Types.ObjectId,
  questions: [
    { question:String, options:[String], answer:Number }
  ]
},{ timestamps:true });

// EcoTask Schema
const TaskSchema = new mongoose.Schema({
  title:String,
  description:String,
  points:Number
},{ timestamps:true });

// Submission Schema
const SubmissionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  taskId: mongoose.Schema.Types.ObjectId,
  proof: String,
  status: { type: String, enum: ["pending","approved","rejected"], default:"pending" }
},{ timestamps:true });

module.exports = {
  User: mongoose.model("User",UserSchema),
  Lesson: mongoose.model("Lesson",LessonSchema),
  Quiz: mongoose.model("Quiz",QuizSchema),
  Task: mongoose.model("Task",TaskSchema),
  Submission: mongoose.model("Submission",SubmissionSchema)
};
