import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import profile from './profile.png'; // This is the image URL path for fallback

const token = localStorage.getItem("Token");
console.log(token);
const Home = () => {
  const [data, setData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [add, setAdd] = useState(false);

  // Fetch all employees
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("http://localhost:5555/", {
          method: "GET", // Default method for this example
          headers: {
            "Content-Type": "application/json", // Specify the type of data expected (optional for GET)
            "Authorization": `${token}`, // Replace 'your-jwt-token' with your actual token
                      },
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
          console.log(result);
        } else {
          console.error("Failed to fetch employees");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  }, []);

  // Add Employee Formik and Yup
  const addFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobilnum: "",
      designation: "",
      gender: "",
      course: "",
      image: null, // Add the image field
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      mobilnum: Yup.string()
        .matches(/^[0-9]+$/, "Only numbers are allowed") // Ensures only numbers
        .length(10, "Mobile number must be exactly 10 digits") // Checks for exact length
        .required("Mobile number is required"),
      designation: Yup.string().required("Designation is required"),
      gender: Yup.string().required("Gender is required"),
      course: Yup.string().required("Course is required"),
      image: Yup.mixed()
        .nullable() // Allows null or undefined
        .notRequired() // Makes the field optional
        .test(
          "fileFormat",
          "Unsupported Format (Only JPG/PNG allowed)",
          (value) => !value || ["image/jpeg", "image/png"].includes(value?.type)
        ),
    }),
   onSubmit: async (value, { resetForm }) => {
  console.log(`this is value:${value.name}`);
  try {
    // Prepare FormData to send
    const formData = new FormData();
    formData.append("name", value.name);
    formData.append("email", value.email);
    formData.append("mobilnum", value.mobilnum);
    formData.append("designation", value.designation);
    formData.append("gender", value.gender);
    formData.append("course", value.course);

    // Ensure image is added if it exists
    if (value.image) {
      formData.append("image", value.image);  // If an image is selected, append the File
    } else {
      // If no image is selected, append a default fallback image or path
      formData.append("image", profile);  // Append the image URL (not a File object)
    }

    // Debugging FormData content
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Sending the formData via fetch
    const response = await fetch('http://localhost:5555/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Make sure the token is correctly passed
      },
      body: formData, // Send the FormData (don't set Content-Type manually)
    });

  

    
            const resp = await response.json(); // Parse the JSON response
            console.log(resp);
        
            // Ensure `resp` is an array before using the spread operator
         
              setData((prevData) => [...prevData, resp.data]); // Add new data to the existing data
           
        
            console.log(data); // Debug: Ensure `data` is correctly updated
            resetForm();
             // Reset the form if needed
       setAdd(false);
  
      } catch (error) {
        console.error('Error:', error);
      } finally {
        // Reset the form after submission
      
      }
    },
  });
  
  // Update Employee Formik and Yup
  const updateFormik = useFormik({
    enableReinitialize: true, // For setting initial values dynamically
    initialValues: {
      name: selectedEmployee?.name || "",
      email: selectedEmployee?.email || "",
      mobilnum: selectedEmployee?.mobilnum || "",
      designation: selectedEmployee?.designation || "",
      gender: selectedEmployee?.gender || "",
      course: selectedEmployee?.course || "",
      image: selectedEmployee?.image || null, // Store the image URL to display
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      mobilnum: Yup.string()
        .matches(/^[0-9]+$/, "Only numbers are allowed")
        .length(10, "Mobile number must be exactly 10 digits")
        .required("Mobile number is required"),
      designation: Yup.string().required("Designation is required"),
      gender: Yup.string().required("Gender is required"),
      course: Yup.string().required("Course is required"),
      image: Yup.mixed()
        .nullable() // Allows null or undefined
        .notRequired() // Makes the field optional
        .test(
          "fileFormat",
          "Unsupported Format (Only JPG/PNG allowed)",
          (value) => !value || ["image/jpeg", "image/png"].includes(value?.type)
        ),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("mobilnum", values.mobilnum);
      formData.append("designation", values.designation);
      formData.append("gender", values.gender);
      formData.append("course", values.course);
      formData.append("_id", selectedEmployee._id); // Include the employee ID for the update
  console.log(values)
      // If an image is selected, append it to the form data
      if (values.image) {
        formData.append("image", values.image); // If there's an image, append it
      } else {
        formData.append("image", profile); // Online image URL
      }
  
      try {
        const response = await fetch(`http://localhost:5555/update/`, {
          method: "PUT",
          headers: {
            Authorization: `${token}`, // Add only the Authorization header
            // Remove "Content-Type" because FormData sets it automatically
          },
          body: formData, // Send the FormData with the image and data
        });
        
        if (response.ok) {
          const updatedEmployee = await response.json(); // The updated employee data from the backend
          console.log(updatedEmployee); // Log the updated data, including imagePath
  
          // Update the state with the updated employee data, including imagePath if changed
          setData((prevData) =>
            prevData.map((item) =>
              item._id === selectedEmployee._id
                ? { ...item, ...updatedEmployee.data, imageUrl: updatedEmployee.imageUrl } // Merge imageUrl into the state
                : item
            )
          );
  
          setSelectedEmployee(null); // Reset selected employee
          alert("Employee updated successfully!");
        } else {
          alert("Failed to update employee.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });


return (

  <div>
    
  <h1 className="w">WellCome Boss</h1>
  <button onClick={() => setAdd(true)}>Add Employee</button>
  {add && (
    <div>
      <h2>Add Employee</h2>
      <form className="homeForm" onSubmit={addFormik.handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={addFormik.values.name}
          onChange={addFormik.handleChange}
        />
        {addFormik.errors.name && <div>{addFormik.errors.name}</div>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={addFormik.values.email}
          onChange={addFormik.handleChange}
        />
        {addFormik.errors.email && <div>{addFormik.errors.email}</div>}
        <input
          type="text"
          name="mobilnum"
          placeholder="Mobile Number"
          value={addFormik.values.mobilnum}
          onChange={addFormik.handleChange}
        />
        {addFormik.errors.mobilnum && <div>{addFormik.errors.mobilnum}</div>}
        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={addFormik.values.designation}
          onChange={addFormik.handleChange}
        />
        {addFormik.errors.designation && (
          <div>{addFormik.errors.designation}</div>
        )}
        <select
         className="select"
          name="gender"
          value={addFormik.values.gender}
          onChange={addFormik.handleChange}
        >
          <option value="" label="Select Gender" />
          <option value="Male" label="Male" />
          <option value="Female" label="Female" />
        </select>
        {addFormik.errors.gender && <div>{addFormik.errors.gender}</div>}
        <input
          type="text"
          name="course"
          placeholder="Course"
          value={addFormik.values.course}
          onChange={addFormik.handleChange}
        />
        {addFormik.errors.course && <div>{addFormik.errors.course}</div>}
        <div>
          <label>Choose file</label>
          <input
            id="fileaplode"
            name="image"
            label="Image"
            type="file"
            onChange={(event) => {
              const file = event.target.files[0];
              addFormik.setFieldValue("image", file);
            }}
          />
        </div>
        {addFormik.errors.image && <div>{addFormik.errors.image}</div>}
        <button type="submit">Submit</button>
        <button onClick={() => setAdd(false)}>NO</button>
      </form>
    </div>
  )}
      
      {selectedEmployee && (
        <div>
          <h2>Update Employee</h2>
          <form className="homeForm" onSubmit={updateFormik.handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={updateFormik.values.name}
              onChange={updateFormik.handleChange}
            />
            {updateFormik.errors.name && <div>{updateFormik.errors.name}</div>}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={updateFormik.values.email}
              onChange={updateFormik.handleChange}
            />
            {updateFormik.errors.email && <div>{updateFormik.errors.email}</div>}
            <input
              type="text"
              name="mobilnum"
              placeholder="Mobile Number"
              value={updateFormik.values.mobilnum}
              onChange={updateFormik.handleChange}
            />
            {updateFormik.errors.mobilnum && (
              <div>{updateFormik.errors.mobilnum}</div>
            )}
            <input
              type="text"
              name="designation"
              placeholder="Designation"
              value={updateFormik.values.designation}
              onChange={updateFormik.handleChange}
            />
            {updateFormik.errors.designation && (
              <div>{updateFormik.errors.designation}</div>
            )}
            <select
            className="select"
              name="gender"
              value={updateFormik.values.gender}
              onChange={updateFormik.handleChange}
            >
              <option value="" label="Select Gender" />
              <option value="Male" label="Male" />
              <option value="Female" label="Female" />
            </select>
            {updateFormik.errors.gender && (
              <div>{updateFormik.errors.gender}</div>
            )}
            <input
              type="text"
              name="course"
              placeholder="Course"
              value={updateFormik.values.course}imageUrl
              onChange={updateFormik.handleChange}
            />
            {updateFormik.errors.course && (
              <div>{updateFormik.errors.course}</div>
            )}
             
          <div>
          <label >Choose file</label>
          <input
            id="fileaplode"
            name="image"
            lable="Image"
            type="file"
            accept=".jpeg,.png,.jpg"
            onChange={(event) =>
              updateFormik.setFieldValue('image', event.target.files[0])
            }
          />
        </div>

            <button type="submit">Update Employee</button>

            <button type="button" onClick={() => setSelectedEmployee(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}
   
 
      <div className="tableDiv">
        <span className="h2"><h2>Employee List</h2></span>
        <table border="1">
          <thead>
            <tr>
            <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Designation</th>
              <th>Gender</th>
              <th>Course</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
        
  {data
    .slice() // Creates a shallow copy of the array
    .reverse() // Reverses the order of the array
    .map((employee, index) => (

      <tr key={employee._id || index}> 
        <td>
          <img className="image" src={employee.imageUrl || profile} alt={employee.name} />
        </td>
        <td>{employee.name}</td>
        <td>{employee.email}</td>
        <td>{employee.mobilnum}</td>
        <td>{employee.designation}</td>
        <td>{employee.gender}</td>
        <td>{employee.course}</td>
        <td>
          <button onClick={() => setSelectedEmployee(employee)}>
            Update
          </button>
          <button
  onClick={async () => {
    try {
      const employeeId = employee._id;

      const response = await fetch(`http://localhost:5555/delete`, {
        method: "DELETE",
        headers: {
          'Authorization': ` ${token}`, // Include the token in the Authorization header
          'Content-Type': 'application/json', // Specify that the request body is JSON
        },
        body: JSON.stringify({ id: employeeId }), // Correctly stringify the body
      });

      if (response.ok) {
        const updatedData = await response.json();
        setData(updatedData);
      } else {
        const errorData = await response.json();
        console.error("Error deleting employee:", errorData.message);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  }}
>
  Delete
</button>

        </td>
      </tr>
    ))}
</tbody>

        </table>
      </div>
    </div>
  );
};

export default Home;
