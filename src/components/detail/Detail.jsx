 
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/useStore";
import "./detail.css";
import { useState } from "react";
const Detail = () =>
{
 
  const[add,setAdd] = useState(false);
  const[addw,setAddw] = useState(false);
  const[addp,setAddp] = useState(false);
  const [addPhotos, setAddPhotos] = useState(false);

  const {currentUser} = useUserStore();
  const {chatId ,user ,isCurrentUserBlocked ,isReceiverBlocked ,changeBlock } = useChatStore();
    const handleBlock = async () => {
      if(!user) return;

      const userDocRef = doc(db, "users", currentUser.id);
      try{
          await updateDoc(userDocRef,{
            blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
          });
          changeBlock();
      }catch(err){
          console.log(err);
      }
    };
    
    return (
        <div className='detail'>
          <div className="user">
            <img src={user?.avatar || "./avatar.png"} alt="" />
            <h2>{user?.username }</h2>
            <p >you have nothing to loose </p>
          </div>
          <div className="info">
            <div className="option">
              <div className="title">
                <span>Wallpaper</span>
                <img src={add ? "./arrowDown.png" : "./arrowUp.png" }
                onClick={() => setAdd((prev) => !prev)}/>
              </div>
            </div>

            <div className="option">
              <div className="title">
                <span>Chat Settings</span>
                <img src={addw ? "./arrowDown.png" : "./arrowUp.png" }
                onClick={() => setAddw((prev) => !prev)}/>
                
              </div>
            </div>

            <div className="option">
              <div className="title">
                <span>Privacy & help</span>
                <img src={addp ? "./arrowDown.png" : "./arrowUp.png" }
                onClick={() => setAddp((prev) => !prev)}/>
                
              </div>

            </div>
          
            <div className="option">
              <div className="title">
                <span>Shared photos</span>
                <img src={addPhotos ? "./arrowDown.png" : "./arrowUp.png"}
              onClick={() => setAddPhotos((prev) => !prev)}/>
              </div>
              {addPhotos && (
                  <div className="photos">
                    <div className="photoItem">
                      <div className="photoDetail">
                      <img src="./dp.JPG" alt="" height="40%" width="100%"  />
                      <span>dp.jpg</span>
                      </div>
                      <img src="./download.png" alt="" className="icon"/>
                    </div>
                   
                    
                    <div className="photoItem">
                      <div className="photoDetail">
                      <img src="./clg.png" alt="" height="40%" width="100%"  />
                      <span>clg.png</span>
                      </div>
                      <img src="./download.png" alt="" className="icon"/>
                      
                    </div>
                  </div>)}
            </div>
                
            {/* <div className="option">
              <div className="title">
                <span>Shared Files</span>
                  <img src="./arrowUp.png" alt="" />
              </div>
            </div> */}
            <button onClick={handleBlock}>
            {
             isCurrentUserBlocked
             ? "You are Blocked!"
             : isReceiverBlocked
             ? "UnBlock"
             : "Block User"    
            }
            </button>
            <button className="logout" onClick={()=> auth.signOut()}>Logout</button>
            
          </div>
        </div>
      );
};

export default Detail;

