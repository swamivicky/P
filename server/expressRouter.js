// The page where the routers found

import express from 'express';
import { Employee, Managers } from "./models/userModel.js";
import path from 'path';
import multer from 'multer';
import jwt from 'jsonwebtoken';  // the  tokens for athentications
const secretKey = "vickyMERN@123";
// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to store images
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Append timestamp to avoid name conflicts
  },
});

const upload = multer({ storage: storage }); // Configure multer with storage settings

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to the Server!'); // Or any response you want
});


router.get('/', async (req, res) => {
  console.log(req.headers.authorization);
  const jwtToken = req.headers.authorization; // Ensure jwtToken is assigned

  if (jwtToken) {
    try {
      const verify = jwt.verify(jwtToken, secretKey);

      console.log(verify);

      if (verify) {
        console.log("Token is valid");

        const employees = await Employee.find({});

        // Map over the employees and add the full image URL
        const employeesWithImageUrls = employees.map((employee) => ({
          ...employee.toObject(),
          imageUrl: employee.imagePath ? `http://localhost:5555${employee.imagePath}` : null, // Full URL for the image
        }));

        return res.status(200).json(employeesWithImageUrls);
      } else {
        console.log("Token is invalid");
        return res.status(401).json({ error: "Invalid token" });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({ message: error.message });
    }
  } else {
    console.error("JWT token not provided in headers");
    return res.status(401).json({ error: "JWT token must be provided" });
  }
});




router.delete('/delete', async (req, res) => {
  const jwtToken = req.headers.authorization; // Get the JWT token from headers
console.log(jwtToken);
  if (jwtToken) {
    try {
      const verify = jwt.verify(jwtToken, secretKey);

      console.log(verify);

      if (verify) {
        console.log("Token is valid");
console.log(req);
        const { id } = req.body; // Get the ID from the request body

        if (!id) {
          return res.status(400).json({ message: 'Employee ID is required.' });
        }

        try {
          // Delete the employee by ID
          const deletedEmployee = await Employee.findByIdAndDelete(id);

          if (!deletedEmployee) {
            return res.status(404).json({ message: 'Employee not found.' });
          }

          // Fetch all employees to include in the response
          const employees = await Employee.find({});

          // Add `imageUrl` to each employee's data
          const enrichedEmployees = employees.map((employee) => ({
            ...employee.toObject(),
            imageUrl: employee.imagePath ? `http://localhost:5555${employee.imagePath}` : null,
          }));

          // Return the updated list of employees
          return res.status(200).json(enrichedEmployees);
        } catch (error) {
          console.error('Error deleting employee:', error.message);
          return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
      } else {
        console.log("Token is invalid");
        return res.status(401).json({ error: "Invalid token" });
      }
    } catch (error) {
      console.error("JWT verification error:", error.message);
      return res.status(401).json({ error: "JWT verification failed" });
    }
  } else {
    console.error("JWT token not provided in headers");
    return res.status(401).json({ error: "JWT token must be provided" });
  }
});


router.put("/update", upload.single("image"), async (req, res) => {
  const jwtToken = req.headers.authorization; // Get the JWT token from headers
console.log(`token is :${jwtToken}`)
  if (jwtToken) {
    try {
      const verify = jwt.verify(jwtToken, secretKey);

      console.log(verify);

      if (verify) {
        console.log("Token is valid");

        const { _id, name, email, mobilnum, designation, gender, course } = req.body;

        if (!_id) {
          return res.status(400).json({ message: "Employee ID is required." });
        }

        const updatedData = {
          name,
          email,
          mobilnum,
          designation,
          gender,
          course,
        };

        if (req.file) {
          const imageUrl = `http://localhost:5555/uploads/${req.file.filename}`;
          updatedData.imagePath = `/uploads/${req.file.filename}`;
          updatedData.imageUrl = imageUrl; // Add the imageUrl field
        }

        try {
          const updatedEmployee = await Employee.findByIdAndUpdate(_id, updatedData, { new: true });

          if (!updatedEmployee) {
            return res.status(404).json({ message: "Employee not found." });
          }

          res.status(200).json({
            message: "Employee updated successfully!",
            data: updatedEmployee,
            imageUrl: updatedEmployee.imageUrl,
          });
        } catch (error) {
          console.error("Error updating employee:", error);
          res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
      } else {
        console.log("Token is invalid");
        return res.status(401).json({ error: "Invalid token" });
      }
    } catch (error) {
      console.error("JWT verification error:", error.message);
      return res.status(401).json({ error: "JWT verification failed" });
    }
  } else {
    console.error("JWT token not provided in headers");
    return res.status(401).json({ error: "JWT token must be provided" });
  }
});


router.post("/add", upload.single("image"), async (req, res) => {
  const authHeader = req.headers.authorization;
  console.log(`this is token: ${authHeader}`)
  if (!authHeader) {
    return res.status(401).json({ error: "JWT token must be provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token from "Bearer <token>"
  try {
    const verify = jwt.verify(token, secretKey); // Verify the JWT token
    if (!verify) {
      return res.status(401).json({ error: "Invalid token" });
    }
    console.log("Token is valid:", verify);

    console.log(req.body);
    try {
      // Assuming the incoming data is JSON
      const { name, email, mobilnum, designation, gender, course } = req.body;

      // Validate required fields
      if (!name || !email || !mobilnum || !designation || !gender || !course) {
        return res.status(400).json({ error: "All fields are required!" });
      }

      // Process the data (you can add database saving logic here)
      const newUser = {
        name,
        email,
        mobilnum,
        designation,
        gender,
        course,
      };

      if (req.file) {
        const imageUrl = `http://localhost:5555/uploads/${req.file.filename}`;
        console.log(imageUrl);
        newUser.imagePath = `/uploads/${req.file.filename}`;
        newUser.imageUrl = imageUrl; // Add the imageUrl field
      }
      console.log("newUser");
      console.log(newUser);

      try {
        console.log("s");
        const savedEmployee = await new Employee(newUser).save();

        console.log("savedEmployee");
        console.log(savedEmployee.imageUrl);
        res.status(200).json({
          message: "Employee added successfully!",
          data: savedEmployee,
          imageUrl: savedEmployee.imageUrl,
        });
      } catch (err) {
        res.status(400).send("Error adding employee.");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

router.post("/signUp", async (req, res) => {
 console.log(`This is req : ${req.body}`);
  let TF; 
    try {
     
  
      // 2. Check if the phone number already exists in the MongoDB collection
      const existingUser = await Managers.findOne({ phoneNumber: req.body.PhoneNumber });
  
      if (!existingUser) {
        // 3. If no user found with the provided phone number, validate the password
        console.log(`this is pass word${req.body.PassWord}`);
  
        // 5. Create a new employee document
        const newUser = new Managers({
          name: req.body.UserName,
          pass:req.body.PassWord,
          mobilnum: req.body.PhoneNumber,
        });
        
        console.log("newUser")
  console.log(`new user after assigning :${newUser}`);
        // 6. Save the new user document to the MongoDB collection
        await Managers.create(newUser);
  
        TF = 1; // Set response flag to 1 for successful registration
        res.json(TF); // Send success response
      } else {
        // 7. If a user with the same phone number already exists
        TF = 2; // Set response flag to 2 indicating phone number is already in use
        res.json(TF); // Send response indicating error
      }
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ loggedIn: false, error: "Internal Server Error" });
    }
  
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  try {


    // 2. Find the user by phone number in the Employee collection
    const existingUser = await Managers.findOne({ mobilnum: req.body.PhoneNumber });

    if (existingUser) {
      // 3. Check if the provided password matches the stored password
      if (req.body.PassWord === existingUser.pass) {
        // 4. Generate a JWT token for the user
        const token = jwt.sign({ user: existingUser }, secretKey, {
          expiresIn: '1h' // Optional: Set token expiration time
        });

        // 5. Send the token and login status in the response
        const info = {
          UToken: token,
          loged: 1, // Login success flag
        };

        res.json(info); // Send the response with the token and login status
      } else {
        // 6. If the password is incorrect
        const TF = 2; // Flag for incorrect password
        res.json(TF); // Send response indicating password mismatch
      }
    } else {
      // 7. If no user is found with the provided phone number
      const TF = 3; // Flag for user not found
      res.json(TF); // Send response indicating user not found
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ loggedIn: false, error: "Internal Server Error" });
  }
});
export default router; // Use ES Modules export
