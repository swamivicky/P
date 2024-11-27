import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import SignUp from "./SignUp";
const Views = () => {
  return (
    <Routes>
      
      <Route path="/Home" element={<Home />} />
      <Route path="*" element={<Login/>}/>
      <Route path="/signUp" element={<SignUp/>}/>
    </Routes>
  );
};
export default Views;