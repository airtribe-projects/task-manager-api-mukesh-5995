const express = require("express");
const server = express();
let tasksData =require('./task.json');
const port = 3000;
server.use(express.json());
// Middleware to handle JSON parsing errors
server.listen(port, (err)=>{
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is running on port ${port}`);
});

// Error handling middleware for JSON parsing errors
server.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).send("Invalid JSON.");
    }
    next();
});

// Routes get method
server.get("/", (req, res) => {
    return res.send("Hello World");
});

// Routes for tasks
server.get("/tasks", (req, res) => {
    const queryParams = req.query;
    if(!queryParams.id){
        console.log(`No params`);
        return res.status(200).send(tasksData.tasks);
    } else{
        return res.status(200).send(tasksData.tasks.find(s => s.id === parseInt(queryParams.id)));
    }
});

// Route to get task by ID
server.get("/tasks/:id", (req, res) => {
    console.log(`Requested ID: ${req.params.id}`);
    if(!tasksData.tasks.find(s => s.id === parseInt(req.params.id))){
        return res.status(404).send("tasks not found");
    }
    return res.send(tasksData.tasks.find(s => s.id === parseInt(req.params.id)));
});


// Route to create a new task
server.post("/tasks", (req, res) => {
    // const newTask = {
    //     id: tasksData.tasks.length + 1,
    //     title: "Set up environment",
    //     description: "Install Node.js, npm, and git",
    //     completed: false
    // };
    const newTask = req.body;
    console.log("Received new task:", newTask);
    if(!newTask.title || !newTask.description || newTask.completed === undefined){
        return  res.status(400).send("Invalid tasks data");
    };
    tasksData.tasks.push({id: tasksData.tasks.length + 1, ...newTask});
    return res.status(201).send(newTask);
});

// Route to update a task by ID
server.put("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    if(isNaN(taskId)){
        return res.status(400).send("Invalid tasks ID");
    }
    const taskIndex = tasksData.tasks.findIndex(s => s.id === taskId);
    console.log("tasks index to be updated:", taskIndex);
    if (taskIndex === -1) {
        return res.status(404).send("tasksData not found");
    }
    
    // const updatedTask = [{
    //     ...tasksData.tasks[taskIndex],
    //     title: "Updated Name",
    //     description: "Updated Description",
    //     completed: "true"
    // }];
    const updatedTask = req.body;

    // Title validation
    if (!updatedTask.title || typeof updatedTask.title !== "string" || updatedTask.title.trim() === "") {
        return res.status(400).send("Title cannot be empty.");
    }

    // Description validation
    if (!updatedTask.description || typeof updatedTask.description !== "string" || updatedTask.description.trim() === "") {
        return res.status(400).send("Description cannot be empty.");
    }

    // Completed must be boolean
    if (typeof updatedTask.completed !== "boolean") {
        return res.status(400).send("Completed must be a boolean (true or false).");
    }
    
    tasksData.tasks[taskIndex] = {id: taskId, ...updatedTask};
    console.log("tasks updated:", updatedTask);
    return res.send(updatedTask);
});

// Route to delete a task by ID
server.delete("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    if(isNaN(taskId)){
        return res.status(400).send("Invalid tasks ID");
    }
    const taskIndex = tasksData.tasks.findIndex(s => s.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).send("tasks not found");
    }
    
    tasksData.tasks.splice(taskIndex, 1);
    console.log("tasks deleted with ID:", taskId);
    return res.status(200).send("tasks deleted successfully");
});

module.exports = server;