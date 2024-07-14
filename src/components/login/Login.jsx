import { useState } from "react";
import  "./login.css";
import { toast } from "react-toastify";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import {doc, setDoc} from "firebase/firestore";
import  upload  from "../../lib/upload";

const Login = () => {

    const[avatar,setAvatar] = useState({
        file: null,
        url:"",
    });

    const handleAvatar = e =>{
        if(e.target.files[0]){
            setAvatar({
                file:e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }   
    };

    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@gmail\.com$/;
        return re.test(String(email).toLowerCase());
      };
    
      const validatePassword = (password) => {
        return password.length >= 6;
      };

    const handleRegister = async (e) =>{

        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        
        const { username, email, password } = Object.fromEntries(formData);

        if (!username || !email || !password) {
            toast.error("All fields are required!");
            setLoading(false);
            return;
          }
      
          if (!validateEmail(email)) {
            toast.error("Invalid email address!");
            setLoading(false);
            return;
          }
      
          if (!validatePassword(password)) {
            toast.error("Password must be at least 6 characters long!");
            setLoading(false);
            return;
          }

        try{
            const res = await createUserWithEmailAndPassword(auth,email,password);
            console.log("User created with UID:", res.user.uid);
            
            const imgUrl = await upload(avatar.file);
            
            await setDoc(doc(db, "users", res.user.uid),{
                username,
                email,
                avatar: imgUrl || "",
                id: res.user.uid,
                blocked: [],
            });
            await setDoc(doc(db, "userchats", res.user.uid),{
                chats: [],
            });

            toast.success("Account created!..  you can login now!.. ");

        }catch(err){
            console.log(err);
            toast.error(err.message);
        }
        finally{
            setLoading(false);

        }
    };

    const handleLogin = async (e) =>{
        
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        
        const { email, password } = Object.fromEntries(formData);
        
        if (!email || !password) {
            toast.error("All fields are required!");
            setLoading(false);
            return;
          }
      
          if (!validateEmail(email)) {
            toast.error("Invalid email address!");
            setLoading(false);
            return;
          }
      
          if (!validatePassword(password)) {
            toast.error("Password must be at least 6 characters long!");
            setLoading(false);
            return;
          }

        try {
        
        await signInWithEmailAndPassword(auth,email,password);
        
        toast.success("Login successful!");
            
        } catch (err) {
            console.log(err);
            toast.error(err.message);
        }
        finally{
            setLoading(false);
        }
        
    };

  return (
    <div className='login'>
        <div className="item">
            <h2>Welcome back</h2>
            <form onSubmit={handleLogin} > 
                <input type="text" placeholder="Email" name="email" required />
                <input type="password" placeholder="Password" name="password" required minLength="6"/>
                <button type="submit" disabled={loading}>{loading ? "Loading" : "Sign In" } </button>
            </form>
        </div>
        <div className="seperator"></div>
        <div className="item">
            <h2>Create an Account</h2>
            <form onSubmit={handleRegister}> 
                <label htmlFor="file">
                    <img src={avatar.url || "./avatar.png"} alt="" width="100" height="100"/>
                    Upload an Image</label>
                <input type="file" id="file" style={{display:"none"}} onChange={handleAvatar}  />
                <input type="text" placeholder="Username" name="username" required/>
                <input type="text" placeholder="Email" name="email" required />
                <input type="password" placeholder="Password" name="password" required minLength="6"/>
                <button type="submit" disabled={loading} > {loading ? "Loading" : "Sign Up" } </button>
            </form>
        </div>
    </div>
  );
};

export default Login;


























