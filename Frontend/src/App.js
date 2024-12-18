import 'bootstrap/dist/css/bootstrap.css';
import axios from "axios";
import {useEffect, useState} from "react";

const App = () => {
    // Backend API URL
    const baseUrl = 'http://localhost:4000/tasks';

    const [tasks, setTasks]             = useState([]);
    const [title, setTitle]             = useState('');
    const [description, setDescription] = useState('');
    const [taskId, setTaskId]           = useState(null);
    const [isEdit, setIsEdit]           = useState(false);
    const [successMsg, setSuccessMsg]   = useState(null);
    const [errorMsg, setErrorMsg]       = useState(null);

    // Fetch all todos
    const getTasks = async () => {
        try {
            // Fetch data from backend
            const response = await axios.get(`${baseUrl}`);

            // Set todos data to todos state
            setTasks(response.data.data);

            // Show success message
            setSuccessMsg(response.data.message);
        } catch (error) {
            console.log(error.response);

            // Show error message
            setErrorMsg(error.response.data.message);
        } finally {
            // Hide success/error message after 5 seconds
            hideMsg();
        }
    };

    // Add new todo
    const addTaskHandler = async (e) => {
        // Prevent default form submission
        e.preventDefault();//padlena 
        try {
            // Send post request to backend by sending title and description
            const response = await axios.post(`${baseUrl}`, {title, description});

            // Add new todo and update todos state
            setTasks([...tasks, response.data.data]);

            // Reset todo form
            setTitle('');
            setDescription('');

            // Show success message
            setSuccessMsg(response.data.message);
        } catch (error) {
            console.log(error.response);
            // Show error message
            setErrorMsg(error.response.data.message);
        } finally {
            // Hide success/error message after 5 seconds
            hideMsg();
        }
    };

    // Cancel/Reset todo form
    const cancelTaskHandler = () => {
        setTitle('');
        setDescription('');
        setIsEdit(false);
    };

    // Edit todo
    const editTaskHandler = async (task) => {
        // Set todo data to todo form
        setTitle(task.title);
        setDescription(task.description);
        setTaskId(task.id);
        setIsEdit(true);
    };

    // Update todo
    const updateTaskHandler = async (e) => {
        // Prevent default form submission
        e.preventDefault();
        try {
            // Send put request to backend by sending title and description
            const response     = await axios.put(`${baseUrl}/${taskId}`, {title, description});

            // Update todo in todos state
            const updatedTasks = tasks.map(task => {
                if (task.id === taskId) {
                    task.title       = title;
                    task.description = description;
                }
                return task;
            });

            // Update todos state
            setTasks(updatedTasks);

            // Reset todo form
            setTitle('');
            setDescription('');
            setTaskId(null);
            setIsEdit(false);

            // Show success message
            setSuccessMsg(response.data.message);
        } catch (error) {
            console.log(error.response);
            // Show error message
            setErrorMsg(error.response.data.message);
        } finally {
            // Hide success/error message after 5 seconds
            hideMsg();
        }
    };

    // Delete todo
    const deleteTaskHandler = async (id) => {
        try {
            // Send delete request to backend
            const response      = await axios.delete(`${baseUrl}/${id}`);

            // Remove todo from todos state
            const filteredTasks = tasks.filter(task => task.id !== id);

            // Update todos state
            setTasks(filteredTasks);

            // Show success message
            setSuccessMsg(response.data.message);
        } catch (error) {
            console.log(error.response);
            // Show error message
            setErrorMsg(error.response.data.message);
        } finally {
            // Hide success/error message after 5 seconds
            hideMsg();
        }
    };

    // Submit handler
    const submitHandler = async (e) => {
        // Conditionally call addTodoHandler or updateTodoHandler
        if (isEdit) {
            await updateTaskHandler(e);
        } else {
            await addTaskHandler(e);
        }
    };

    // Hide success/error message after 5 seconds
    const hideMsg = () => {
        setTimeout(() => {
            setSuccessMsg(null);
            setErrorMsg(null);
        }, 5000);
    };


    // Fetch all todos on page load or component mounted
    useEffect(() => {
        getTasks();
    }, []);

    return (
        <div className="container">
            <h1 className="h1 text-center">Task Tracker</h1>
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h4 className="card-title">
                                Add Task
                            </h4>
                        </div>
                        <form onSubmit={submitHandler}>
                            <div className="card-body">
                                <div className="form-group mb-3">
                                    <label htmlFor="title" className="form-label">Title</label>
                                    <input type="text" id="title" name="title" className="form-control"
                                           placeholder="Enter title" required autoFocus value={title}
                                           onChange={e => setTitle(e.target.value)}/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea className="form-control" name="description"
                                              id="description" cols="30" rows="10"
                                              placeholder="Enter description" required value={description}
                                              onChange={e => setDescription(e.target.value)}></textarea>
                                </div>
                            </div>
                            <div className="card-footer">
                                <p className="text-end">
                                    <button type="button" className="btn btn-danger btn-lg" onClick={cancelTaskHandler}>
                                        Cancel
                                    </button>
                                    {isEdit ?
                                        <button type="submit" className="btn btn-primary btn-lg ms-2">
                                            Update
                                        </button> :
                                        <button type="submit" className="btn btn-primary btn-lg ms-2">
                                            Save
                                        </button>}
                                </p>
                            </div>
                        </form>
                    </div>

                    {successMsg &&
                        <div className="alert alert-success" role="alert">
                            {successMsg}
                        </div>
                    }

                    {errorMsg &&
                        <div className="alert alert-danger" role="alert">
                            {errorMsg}
                        </div>
                    }
                </div>
            </div>

            <div className="row mt-5 mb-5">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">
                                Task List
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover table-striped">
                                    <thead>
                                    <tr>
                                        <th className="text-center">SL#</th>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {tasks.map((task, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{index + 1}</td>
                                            <td>{task.title}</td>
                                            <td>
                                                {task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description}
                                            </td>
                                            <td className="text-center">
                                                <button type="button" className="btn btn-sm btn-primary btn-sm"
                                                        onClick={editTaskHandler.bind(this, task)}>
                                                    Edit
                                                </button>
                                                <button type="button" className="btn btn-sm btn-danger btn-sm ms-2"
                                                        onClick={deleteTaskHandler.bind(this, task.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;