 
import "./list.css";
import Userinfo from "./userinfo/Userinfo";
import Chatlist from "./chatlist/Chatlist";
const List = () =>
{
    return (
        <div className='list'>
          <div className="top">
          <Userinfo/></div>
          <div className="bottom">
          <Chatlist/></div>
        </div>
      )
}

export default List;